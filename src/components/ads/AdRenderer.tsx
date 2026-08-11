"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  BusinessAd,
  AdType,
  FloatingAdLayout,
} from "@/services/ads.service";

interface AdRendererProps {
  ads: BusinessAd[];
  type?: AdType;
  position?: BusinessAd["position"];
  className?: string;
}

export default function AdRenderer({
  ads,
  type,
  position,
  className = "",
}: AdRendererProps) {
  const [isMobile, setIsMobile] = useState(false);

  // ======================================================
  // DEVICE DETECTION
  // ======================================================

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();

    window.addEventListener(
      "resize",
      checkDevice
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkDevice
      );
    };
  }, []);

  // ======================================================
  // FILTER ADS
  // ======================================================

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      if (!ad.active) {
        return false;
      }

      if (type && ad.type !== type) {
        return false;
      }

      if (
        position &&
        ad.position !== position
      ) {
        return false;
      }

      if (
        isMobile &&
        ad.mobileEnabled === false
      ) {
        return false;
      }

      if (
        !isMobile &&
        ad.desktopEnabled === false
      ) {
        return false;
      }

      return true;
    });
  }, [
    ads,
    type,
    position,
    isMobile,
  ]);

  // ======================================================
  // PRIORITY
  // ======================================================

  const sortedAds = useMemo(() => {
    return [...filteredAds].sort(
      (a, b) =>
        (b.priority ?? 1) -
        (a.priority ?? 1)
    );
  }, [filteredAds]);

  if (!sortedAds.length) {
    return null;
  }

  return (
    <div
      className={`ads-renderer ${className}`}
    >
      {sortedAds.map((ad) => (
        <AdItem
          key={ad.id}
          ad={ad}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}


// ======================================================
// AD ITEM
// ======================================================

function AdItem({
  ad,
  isMobile,
}: {
  ad: BusinessAd;
  isMobile: boolean;
}) {
  switch (ad.type) {
    case "banner":
      return (
        <BannerAd
          ad={ad}
          isMobile={isMobile}
        />
      );

    case "native":
      return (
        <NativeAd
          ad={ad}
          isMobile={isMobile}
        />
      );

    case "popup":
      return (
        <PopupAd
          ad={ad}
          isMobile={isMobile}
        />
      );

    case "page_transition":
      return (
        <PageTransitionAd
          ad={ad}
          isMobile={isMobile}
        />
      );

    case "sticky_bottom":
      return (
        <StickyBottomAd
          ad={ad}
          isMobile={isMobile}
        />
      );

    case "cube":
      return (
        <CubeAd
          ad={ad}
          isMobile={isMobile}
        />
      );

    case "floating_tv":
      return (
        <FloatingTvAd
          ad={ad}
          isMobile={isMobile}
        />
      );

    case "shorts_video":
      return (
        <ShortsVideoAd
          ad={ad}
          isMobile={isMobile}
        />
      );

    default:
      return null;
  }
}
function getFloatingLayout(
  ad: BusinessAd,
  isMobile: boolean
): FloatingAdLayout["desktop"] | undefined {
  const layout = ad.layout;

  if (!layout) {
    return undefined;
  }

  // NormalAdLayout has only scale.
  // FloatingAdLayout has width, height, x, y and scale.
  const deviceLayout = isMobile
    ? layout.mobile
    : layout.desktop;

  if (
    typeof deviceLayout !== "object" ||
    deviceLayout === null ||
    !("width" in deviceLayout) ||
    !("height" in deviceLayout) ||
    !("x" in deviceLayout) ||
    !("y" in deviceLayout) ||
    !("scale" in deviceLayout)
  ) {
    return undefined;
  }

  return {
    width: Number(deviceLayout.width),
    height: Number(deviceLayout.height),
    x: Number(deviceLayout.x),
    y: Number(deviceLayout.y),
    scale: Number(deviceLayout.scale),
  };
}
// ======================================================
// COMMON LINK
// ======================================================

function AdLink({
  href,
  openInNewTab,
  children,
  className = "",
}: {
  href?: string;
  openInNewTab?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!href) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={
        openInNewTab
          ? "_blank"
          : undefined
      }
      rel={
        openInNewTab
          ? "noopener noreferrer"
          : undefined
      }
      className={className}
    >
      {children}
    </a>
  );
}

// ======================================================
// NORMAL SCALE
// ======================================================

function getScale(
  ad: BusinessAd,
  isMobile: boolean
) {
  const layout = ad.layout;

  if (!layout) {
    return 1;
  }

  const deviceLayout = isMobile
    ? layout.mobile
    : layout.desktop;

  if (
    deviceLayout &&
    "scale" in deviceLayout
  ) {
    return deviceLayout.scale ?? 1;
  }

  return 1;
}

// ======================================================
// BANNER
// ======================================================

function BannerAd({
  ad,
  isMobile,
}: {
  ad: Extract<
    BusinessAd,
    { type: "banner" }
  >;
  isMobile: boolean;
}) {
  const scale = getScale(
    ad,
    isMobile
  );

  return (
    <div
      className="flex w-full justify-center overflow-hidden"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      <AdLink
        href={ad.link}
        openInNewTab={
          ad.openInNewTab
        }
        className="block"
      >
        <img
          src={ad.image}
          alt={ad.title}
          className="block max-w-full h-auto"
        />
      </AdLink>
    </div>
  );
}

// ======================================================
// NATIVE
// ======================================================

function NativeAd({
  ad,
  isMobile,
}: {
  ad: Extract<
    BusinessAd,
    { type: "native" }
  >;
  isMobile: boolean;
}) {
  const scale = getScale(
    ad,
    isMobile
  );

  return (
    <div
      className="flex justify-center"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      <AdLink
        href={ad.link}
        openInNewTab={
          ad.openInNewTab
        }
        className="block"
      >
        <img
          src={ad.image}
          alt={ad.title}
          className="max-w-full h-auto"
        />
      </AdLink>
    </div>
  );
}

// ======================================================
// POPUP
// ======================================================

function PopupAd({
  ad,
  isMobile,
}: {
  ad: Extract<
    BusinessAd,
    { type: "popup" }
  >;
  isMobile: boolean;
}) {
  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setVisible(true);
      },
      (ad.delay ?? 5) * 1000
    );

    return () =>
      window.clearTimeout(timer);
  }, [ad.delay]);

  if (!visible) {
    return null;
  }

  const scale = getScale(
    ad,
    isMobile
  );

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
      <div
        className="relative max-w-[95vw] max-h-[90vh]"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        {ad.closeable !== false && (
          <button
            type="button"
            onClick={() =>
              setVisible(false)
            }
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white"
            aria-label="Close advertisement"
          >
            ×
          </button>
        )}

        <AdLink
          href={ad.link}
          openInNewTab={
            ad.openInNewTab
          }
        >
          <img
            src={ad.image}
            alt={ad.title}
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
          />
        </AdLink>
      </div>
    </div>
  );
}

// ======================================================
// PAGE TRANSITION
// ======================================================

function PageTransitionAd({
  ad,
  isMobile,
}: {
  ad: Extract<
    BusinessAd,
    { type: "page_transition" }
  >;
  isMobile: boolean;
}) {
  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setVisible(true);
      },
      (ad.delay ?? 5) * 1000
    );

    return () =>
      window.clearTimeout(timer);
  }, [ad.delay]);

  if (!visible) {
    return null;
  }

  const scale = getScale(
    ad,
    isMobile
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      {ad.closeable !== false && (
        <button
          type="button"
          onClick={() =>
            setVisible(false)
          }
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-2xl text-white backdrop-blur"
        >
          ×
        </button>
      )}

      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <AdLink
          href={ad.link}
          openInNewTab={
            ad.openInNewTab
          }
        >
          <img
            src={ad.image}
            alt={ad.title}
            className="max-h-screen max-w-screen object-contain"
          />
        </AdLink>
      </div>
    </div>
  );
}

// ======================================================
// STICKY BOTTOM
// ======================================================

function StickyBottomAd({
  ad,
  isMobile,
}: {
  ad: Extract<
    BusinessAd,
    { type: "sticky_bottom" }
  >;
  isMobile: boolean;
}) {
  const [visible, setVisible] =
    useState(true);

  if (!visible) {
    return null;
  }

  const scale = getScale(
    ad,
    isMobile
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9990] flex justify-center px-2 pb-2 pointer-events-none">
      <div
        className="relative pointer-events-auto"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "bottom center",
        }}
      >
        {ad.closeable !== false && (
          <button
            type="button"
            onClick={() =>
              setVisible(false)
            }
            className="absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white shadow"
          >
            ×
          </button>
        )}

        <AdLink
          href={ad.link}
          openInNewTab={
            ad.openInNewTab
          }
        >
          <img
            src={ad.image}
            alt={ad.title}
            className="max-w-[96vw] h-auto rounded-lg shadow-2xl"
          />
        </AdLink>
      </div>
    </div>
  );
}

// ======================================================
// FLOATING TV
// ======================================================

function FloatingTvAd({
  ad,
  isMobile,
}: {
  ad: Extract<
    BusinessAd,
    { type: "floating_tv" }
  >;
  isMobile: boolean;
}) {
  const deviceLayout =
    getFloatingLayout(ad, isMobile);

  const width =
    deviceLayout?.width ??
    ad.width ??
    (isMobile ? 240 : 320);

  const height =
    deviceLayout?.height ??
    (isMobile ? 135 : 180);

  const x =
    deviceLayout?.x ?? 0;

  const y =
    deviceLayout?.y ?? 0;

  const scale =
    deviceLayout?.scale ?? 1;

  const videoUrl = getVideoUrl(
    ad.videoUrl,
    ad.videoType
  );

  if (!videoUrl) {
    return null;
  }

  return (
    <div
      className="fixed z-9980"
      style={{
        width,
        height,
        left: x,
        top: y,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      <video
        src={videoUrl}
        poster={ad.videoPoster}
        autoPlay={ad.autoplay !== false}
        muted={ad.muted !== false}
        loop
        playsInline
        controls={false}
        className="h-full w-full rounded-xl object-cover shadow-2xl"
      />
    </div>
  );
}

// ======================================================
// CUBE
// ======================================================

function CubeAd({
  ad,
  isMobile,
}: {
  ad: Extract<
    BusinessAd,
    { type: "cube" }
  >;
  isMobile: boolean;
}) {
  const deviceLayout =
    getFloatingLayout(ad, isMobile);

  const width =
    deviceLayout?.width ??
    ad.width ??
    (isMobile ? 140 : 160);

  const height =
    deviceLayout?.height ??
    width;

  const x =
    deviceLayout?.x ?? 0;

  const y =
    deviceLayout?.y ?? 0;

  const scale =
    deviceLayout?.scale ?? 1;

  const faces = ad.cubeFaces;

  if (!faces.length) {
    return null;
  }

  const faceImages = ad.cubeSameImage
    ? Array(6).fill(
        faces[0]?.image
      )
    : [
        faces[0]?.image,
        faces[1]?.image,
        faces[2]?.image,
        faces[3]?.image,
        faces[4]?.image,
        faces[5]?.image,
      ];

  const depth = width / 2;

  return (
    <div
      className="fixed z-9970"
      style={{
        left: x,
        top: y,
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        perspective: 1000,
      }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          animation: `adsCubeRotate ${
            Math.max(
              ad.rotationSpeed ?? 4,
              0.5
            )
          }s linear infinite`,
        }}
      >
        <CubeFace
          image={faceImages[0]}
          transform={`rotateY(0deg) translateZ(${depth}px)`}
        />

        <CubeFace
          image={faceImages[1]}
          transform={`rotateY(90deg) translateZ(${depth}px)`}
        />

        <CubeFace
          image={faceImages[2]}
          transform={`rotateY(180deg) translateZ(${depth}px)`}
        />

        <CubeFace
          image={faceImages[3]}
          transform={`rotateY(-90deg) translateZ(${depth}px)`}
        />

        <CubeFace
          image={faceImages[4]}
          transform={`rotateX(90deg) translateZ(${depth}px)`}
        />

        <CubeFace
          image={faceImages[5]}
          transform={`rotateX(-90deg) translateZ(${depth}px)`}
        />
      </div>

      <style jsx>{`
        @keyframes adsCubeRotate {
          from {
            transform: rotateX(0deg)
              rotateY(0deg);
          }

          to {
            transform: rotateX(360deg)
              rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
}
// ======================================================
// CUBE FACE
// ======================================================

function CubeFace({
  image,
  transform,
}: {
  image?: string;
  transform: string;
}) {
  if (!image) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-black"
      style={{
        transform,
        backfaceVisibility:
          "hidden",
      }}
    >
      <img
        src={image}
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}

// ======================================================
// SHORTS VIDEO AD
// ======================================================

function ShortsVideoAd({
  ad,
}: {
  ad: Extract<
    BusinessAd,
    { type: "shorts_video" }
  >;
  isMobile: boolean;
}) {
  const videoUrl = getVideoUrl(
    ad.videoUrl,
    ad.videoType
  );

  if (!videoUrl) {
    return null;
  }

  return (
    <div className="relative mx-auto overflow-hidden rounded-xl">
      <video
        src={videoUrl}
        poster={
          ad.videoPoster ??
          ad.image
        }
        autoPlay={
          ad.autoplay !== false
        }
        muted={
          ad.muted !== false
        }
        playsInline
        loop
        controls={false}
        className="block max-h-[80vh] max-w-full object-contain"
      />
    </div>
  );
}

// ======================================================
// VIDEO URL
// ======================================================

function getVideoUrl(
  url?: string,
  type?: "youtube" | "mp4"
) {
  if (!url) {
    return "";
  }

  if (type === "mp4") {
    return url;
  }

  if (
    type === "youtube" ||
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  ) {
    const match =
      url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/
      );

    if (!match?.[1]) {
      return url;
    }

    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&playsinline=1`;
  }

  return url;
}