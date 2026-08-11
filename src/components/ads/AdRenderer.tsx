"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import { X } from "lucide-react";

import type { BusinessAd } from "@/services/ads.service";

// ======================================================
// TYPES
// ======================================================

interface AdRendererProps {
  ads: BusinessAd[];

  type?:
    | "popup"
    | "page_transition"
    | "floating_tv"
    | "cube"
    | "sticky_bottom"
    | "banner"
    | "native"
    | "shorts_video";

  position?: string;
}

type Device = "desktop" | "mobile";

type RotationAdType =
  | "cube"
  | "floating_tv"
  | "popup";


type PopupTrigger =
  | "article_open"
  | "button_click"
  | "scroll"
  | "time"
  | "exit_intent";

interface PopupAdFields {
  scale?: number;

  trigger?: PopupTrigger;
  triggerTime?: number;
  scrollPercent?: number;
}
const closedFloatingAds = new Set<string>();


// ======================================================
// CLOSED POPUP ADS
//
// MEMORY ONLY
//
// Browser refresh:
// -> resets
//
// SPA navigation:
// -> remains closed
// ======================================================

const closedPopupAds = new Set<string>();

function isPopupAdClosed(adId: string): boolean {
  return closedPopupAds.has(adId);
}

function markPopupAdClosed(adId: string) {
  closedPopupAds.add(adId);
}

function getClosedAdKey(
  type: RotationAdType,
  adId: string
) {
  return `${type}:${adId}`;
}

function isFloatingAdClosed(
  type: RotationAdType,
  adId: string
): boolean {
  return closedFloatingAds.has(
    getClosedAdKey(type, adId)
  );
}

function markFloatingAdClosed(
  type: RotationAdType,
  adId: string
) {
  closedFloatingAds.add(
    getClosedAdKey(type, adId)
  );
}

// ======================================================
// FLOATING LAYOUT
// ======================================================

interface FloatingLayout {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  scale?: number;
}

// ======================================================
// CUBE FIELDS
// ======================================================

interface CubeAdFields {
  cubeFaces?: Array<{
    image?: string;
    link?: string;
  }>;

  width?: number;

  rotationSpeed?: number;
}

// ======================================================
// FLOATING TV FIELDS
// ======================================================

interface FloatingTVFields {
  width?: number;

  videoUrl?: string;

  autoplay?: boolean;

  muted?: boolean;

  videoPoster?: string;
}

// ======================================================
// ROTATION STATE
// ======================================================

interface RotationState {
  lastAdId: string | null;

  recentIds: string[];

  lastUrl: string | null;
}

// ======================================================
// REFERENCE CANVAS
// ======================================================

const DESKTOP_REFERENCE_WIDTH = 1366;

const DESKTOP_REFERENCE_HEIGHT = 768;

const MOBILE_REFERENCE_WIDTH = 440;

const MOBILE_REFERENCE_HEIGHT = 956;

// ======================================================
// ROTATION STORAGE
//
// Rotation state can remain in localStorage.
// This is separate from CLOSE state.
//
// If you also want rotation to reset after refresh,
// remove this storage later.
// ======================================================

function getRotationStorageKey(
  type: RotationAdType
) {
  return `infinia-floating-ad-rotation-${type}`;
}

// ======================================================
// HELPER
// ======================================================

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function getAdField<
  T extends object,
  K extends keyof T
>(
  ad: BusinessAd,
  key: K
): T[K] | undefined {
  return (ad as BusinessAd & T)[key];
}

// ======================================================
// ROTATION STATE
// ======================================================

function readRotationState(
  type: RotationAdType
): RotationState {
  if (
    typeof window === "undefined"
  ) {
    return {
      lastAdId: null,
      recentIds: [],
      lastUrl: null,
    };
  }

  try {
    const raw =
      localStorage.getItem(
        getRotationStorageKey(type)
      );

    if (!raw) {
      return {
        lastAdId: null,
        recentIds: [],
        lastUrl: null,
      };
    }

    const parsed = JSON.parse(raw);

    return {
      lastAdId:
        typeof parsed?.lastAdId ===
        "string"
          ? parsed.lastAdId
          : null,

      recentIds:
        Array.isArray(
          parsed?.recentIds
        )
          ? parsed.recentIds.filter(
              (
                id: unknown
              ): id is string =>
                typeof id === "string"
            )
          : [],

      lastUrl:
        typeof parsed?.lastUrl ===
        "string"
          ? parsed.lastUrl
          : null,
    };
  } catch {
    return {
      lastAdId: null,
      recentIds: [],
      lastUrl: null,
    };
  }
}

// ======================================================
// SAVE ROTATION STATE
// ======================================================

function saveRotationState(
  type: RotationAdType,
  state: RotationState
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    localStorage.setItem(
      getRotationStorageKey(type),
      JSON.stringify(state)
    );
  } catch {
    // Ignore localStorage errors
  }
}

// ======================================================
// SELECT FLOATING AD
// ======================================================

function selectFloatingAd(
  ads: BusinessAd[],
  type: RotationAdType,
  currentUrl: string
): BusinessAd | null {
  // ----------------------------------------------------
  // CLOSED DURING CURRENT SPA SESSION
  //
  // IMPORTANT:
  // No sessionStorage.
  // No localStorage.
  //
  // Full browser refresh clears this automatically.
  // ----------------------------------------------------

  const candidates = ads
    .filter(
      (ad) =>
        ad.type === type &&
        !isFloatingAdClosed(
          type,
          ad.id
        )
    )
    .sort(
      (a, b) =>
        (a.priority ?? 999) -
        (b.priority ?? 999)
    );

  if (!candidates.length) {
    return null;
  }

  // ----------------------------------------------------
  // Only one ad
  // ----------------------------------------------------

  if (candidates.length === 1) {
    return candidates[0];
  }

  const state =
    readRotationState(type);

  // ----------------------------------------------------
  // Same URL
  //
  // Keep same advertisement.
  // ----------------------------------------------------

  if (
    state.lastUrl === currentUrl &&
    state.lastAdId
  ) {
    const existing =
      candidates.find(
        (ad) =>
          ad.id ===
          state.lastAdId
      );

    if (existing) {
      return existing;
    }
  }

  // ----------------------------------------------------
  // First selection
  // ----------------------------------------------------

  if (!state.lastAdId) {
    return candidates[0];
  }

  // ----------------------------------------------------
  // Find previous advertisement
  // ----------------------------------------------------

  const currentIndex =
    candidates.findIndex(
      (ad) =>
        ad.id ===
        state.lastAdId
    );

  if (currentIndex === -1) {
    return candidates[0];
  }

  // ----------------------------------------------------
  // Next advertisement
  // ----------------------------------------------------

  const nextIndex =
    (currentIndex + 1) %
    candidates.length;

  return candidates[nextIndex];
}


// ======================================================
// SELECT POPUP AD
// ======================================================

function selectPopupAd(
  ads: BusinessAd[],
  currentUrl: string
): BusinessAd | null {
  const candidates = ads
    .filter(
      (ad) =>
        ad.type === "popup" &&
        !isPopupAdClosed(ad.id)
    )
    .sort(
      (a, b) =>
        (a.priority ?? 999) -
        (b.priority ?? 999)
    );

  if (!candidates.length) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  const state =
  readRotationState("popup");

  // Same URL -> same popup
  if (
    state.lastUrl === currentUrl &&
    state.lastAdId
  ) {
    const existing =
      candidates.find(
        (ad) =>
          ad.id === state.lastAdId
      );

    if (existing) {
      return existing;
    }
  }

  // First popup
  if (!state.lastAdId) {
    return candidates[0];
  }

  const currentIndex =
    candidates.findIndex(
      (ad) =>
        ad.id === state.lastAdId
    );

  if (currentIndex === -1) {
    return candidates[0];
  }

  const nextIndex =
    (currentIndex + 1) %
    candidates.length;

  return candidates[nextIndex];
}
// ======================================================
// MAIN AD RENDERER
// ======================================================

export default function AdRenderer({
  ads,
  type,
  position,
}: AdRendererProps) {
  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [
    device,
    setDevice,
  ] = useState<Device>(
    "desktop"
  );

  // ====================================================
  // DEVICE DETECTION
  // ====================================================

  useEffect(() => {
    const updateDevice = () => {
      setDevice(
        window.innerWidth <= 768
          ? "mobile"
          : "desktop"
      );
    };

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
  // CURRENT URL
  // ====================================================

  const currentUrl =
    useMemo(() => {
      const query =
        searchParams?.toString();

      return query
        ? `${pathname}?${query}`
        : pathname;
    }, [
      pathname,
      searchParams,
    ]);

  const [popupAd, setPopupAd] =
  useState<BusinessAd | null>(null);

const [popupVisible, setPopupVisible] =
  useState(false);

  // ====================================================
  // VISIBLE ADS
  // ====================================================

  const visibleAds =
    useMemo(() => {
      return ads
        .filter(
          (ad) =>
            ad.active === true
        )

        .filter((ad) => {
          if (
            device === "desktop"
          ) {
            return (
              ad.desktopEnabled !==
              false
            );
          }

          return (
            ad.mobileEnabled !==
            false
          );
        })

        .filter((ad) => {
          if (
            type &&
            ad.type !== type
          ) {
            return false;
          }

          if (
            position &&
            ad.position !== position
          ) {
            return false;
          }

          // Default renderer:
          // only floating ads

          if (
            !type &&
            !position
          ) {
            return (
              ad.type === "cube" ||
              ad.type ===
                "floating_tv"
            );
          }

          return true;
        })

        .sort(
          (a, b) =>
            (a.priority ?? 999) -
            (b.priority ?? 999)
        );
    }, [
      ads,
      device,
      type,
      position,
    ]);

  // ====================================================
  // SELECT FLOATING ADS
  // ====================================================

  const selectedFloatingAds =
    useMemo(() => {
      const result: {
        cube:
          | BusinessAd
          | null;

        floatingTv:
          | BusinessAd
          | null;
      } = {
        cube: null,

        floatingTv: null,
      };

      const cubeAds =
        visibleAds.filter(
          (ad) =>
            ad.type === "cube"
        );

      const floatingTvAds =
        visibleAds.filter(
          (ad) =>
            ad.type ===
            "floating_tv"
        );

      // ------------------------------------------------
      // Cube
      // ------------------------------------------------

      if (
        cubeAds.length
      ) {
        result.cube =
          selectFloatingAd(
            cubeAds,
            "cube",
            currentUrl
          );
      }

      // ------------------------------------------------
      // Floating TV
      // ------------------------------------------------

      if (
        floatingTvAds.length
      ) {
        result.floatingTv =
          selectFloatingAd(
            floatingTvAds,
            "floating_tv",
            currentUrl
          );
      }

      return result;
    }, [
      visibleAds,
      currentUrl,
    ]);

  // ====================================================
  // SAVE ROTATION STATE
  // ====================================================

  useEffect(() => {
    const cube =
      selectedFloatingAds.cube;

    if (cube) {
      const state =
        readRotationState(
          "cube"
        );

      if (
        state.lastUrl !==
        currentUrl
      ) {
        saveRotationState(
          "cube",
          {
            lastAdId:
              cube.id,

            recentIds: [
              ...state.recentIds,
              cube.id,
            ].slice(-5),

            lastUrl:
              currentUrl,
          }
        );
      }
    }

    const floatingTv =
      selectedFloatingAds.floatingTv;

    if (floatingTv) {
      const state =
        readRotationState(
          "floating_tv"
        );

      if (
        state.lastUrl !==
        currentUrl
      ) {
        saveRotationState(
          "floating_tv",
          {
            lastAdId:
              floatingTv.id,

            recentIds: [
              ...state.recentIds,
              floatingTv.id,
            ].slice(-5),

            lastUrl:
              currentUrl,
          }
        );
      }
    }
  }, [
    selectedFloatingAds,
    currentUrl,
  ]);


  // ====================================================
// POPUP AD
// ====================================================

useEffect(() => {
  if (type && type !== "popup") {
    return;
  }

  const selected = selectPopupAd(
    visibleAds,
    currentUrl
  );

  if (!selected) {
    return;
  }

  const trigger =
    getAdField<
      PopupAdFields,
      "trigger"
    >(
      selected,
      "trigger"
    ) || "time";

  const triggerTime =
    Number(
      getAdField<
        PopupAdFields,
        "triggerTime"
      >(
        selected,
        "triggerTime"
      )
    ) || 3;

  const scrollPercent =
    clamp(
      Number(
        getAdField<
          PopupAdFields,
          "scrollPercent"
        >(
          selected,
          "scrollPercent"
        )
      ) || 50,
      5,
      95
    );

  let timer: ReturnType<
    typeof setTimeout
  > | null = null;

  let triggered = false;

  const showPopup = () => {
    if (triggered) {
      return;
    }

    triggered = true;

    setPopupAd(selected);
    setPopupVisible(true);

    const state =
      readRotationState("popup");

    saveRotationState(
      "popup",
      {
        lastAdId: selected.id,
        recentIds: [
          ...state.recentIds,
          selected.id,
        ].slice(-5),
        lastUrl: currentUrl,
      }
    );
  };

  // --------------------------------------------------
  // ARTICLE OPEN
  // --------------------------------------------------

  if (trigger === "article_open") {
    showPopup();
  }

  // --------------------------------------------------
  // TIME
  // --------------------------------------------------

  if (trigger === "time") {
    timer = setTimeout(
      showPopup,
      Math.max(triggerTime, 1) * 1000
    );
  }

  // --------------------------------------------------
  // SCROLL
  // --------------------------------------------------

  const handleScroll = () => {
    if (trigger !== "scroll") {
      return;
    }

    const documentHeight =
      document.documentElement
        .scrollHeight;

    const viewportHeight =
      window.innerHeight;

    const scrollable =
      documentHeight -
      viewportHeight;

    if (scrollable <= 0) {
      return;
    }

    const currentPercent =
      (window.scrollY /
        scrollable) *
      100;

    if (
      currentPercent >=
      scrollPercent
    ) {
      showPopup();
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    }
  };

  if (trigger === "scroll") {
    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );
  }

  // --------------------------------------------------
  // EXIT INTENT
  // --------------------------------------------------

  const handleMouseLeave = (
    event: MouseEvent
  ) => {
    if (
      trigger !== "exit_intent"
    ) {
      return;
    }

    if (
      event.clientY <= 5
    ) {
      showPopup();

      document.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    }
  };

  if (trigger === "exit_intent") {
    document.addEventListener(
      "mouseleave",
      handleMouseLeave
    );
  }

  return () => {
    if (timer) {
      clearTimeout(timer);
    }

    window.removeEventListener(
      "scroll",
      handleScroll
    );

    document.removeEventListener(
      "mouseleave",
      handleMouseLeave
    );
  };
}, [
  visibleAds,
  currentUrl,
  type,
]);

  // ====================================================
  // NO ADS
  // ====================================================

  if (
    !visibleAds.length
  ) {
    return null;
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
  <>
    {selectedFloatingAds.cube && (
      <CubeAd
        key={`cube-${selectedFloatingAds.cube.id}`}
        ad={
          selectedFloatingAds.cube
        }
        device={device}
      />
    )}

    {selectedFloatingAds.floatingTv && (
      <FloatingTVAd
        key={`floating-tv-${selectedFloatingAds.floatingTv.id}`}
        ad={
          selectedFloatingAds.floatingTv
        }
        device={device}
      />
    )}

    {popupAd &&
      popupVisible && (
        <PopupAd
          key={`popup-${popupAd.id}`}
          ad={popupAd}
          device={device}
          onClose={() => {
            markPopupAdClosed(
              popupAd.id
            );

            setPopupVisible(false);
            setPopupAd(null);
          }}
        />
      )}
  </>
);
}

// ======================================================
// REFERENCE COORDINATE SYSTEM
// ======================================================

function getFloatingCoordinates(
  layout:
    | FloatingLayout
    | undefined,
  device: Device
) {
  const referenceWidth =
    device === "desktop"
      ? DESKTOP_REFERENCE_WIDTH
      : MOBILE_REFERENCE_WIDTH;

  const referenceHeight =
    device === "desktop"
      ? DESKTOP_REFERENCE_HEIGHT
      : MOBILE_REFERENCE_HEIGHT;

  const viewportWidth =
    typeof window !==
    "undefined"
      ? window.innerWidth
      : referenceWidth;

  const viewportHeight =
    typeof window !==
    "undefined"
      ? window.innerHeight
      : referenceHeight;

  const x = Number(
    layout?.x ?? 0
  );

  const y = Number(
    layout?.y ?? 0
  );

  const scale =
    typeof layout?.scale ===
    "number"
      ? layout.scale
      : 1;

  const xRatio =
    viewportWidth /
    referenceWidth;

  const yRatio =
    viewportHeight /
    referenceHeight;

  const actualX =
    x * xRatio;

  const actualY =
    y * yRatio;

  return {
    actualX,
    actualY,
    scale,
  };
}

// ======================================================
// CLOSE BUTTON
// ======================================================

function AdCloseButton({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Close advertisement"
      title="Close advertisement"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        onClose();
      }}
      style={{
        position: "absolute",

        top: -40,
        right: -100,

        width: 60,
        height: 60,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: 0,

        border:
          "2px solid rgba(255,255,255,0.9)",

        borderRadius: "50%",

        background:
          "rgba(0,0,0,0.88)",

        color: "#fff",

        cursor: "pointer",

        zIndex: 999999,

        boxShadow:
          "0 5px 20px rgba(0,0,0,0.45)",

        backdropFilter:
          "blur(6px)",

        WebkitBackdropFilter:
          "blur(6px)",

        pointerEvents: "auto",
      }}
    >
      <X
        size={24}
        strokeWidth={2.8}
      />
    </button>
  );
}

// ======================================================
// CUBE AD
// ======================================================

function CubeAd({
  ad,
  device,
}: {
  ad: BusinessAd;
  device: Device;
}) {
  const [
    closed,
    setClosed,
  ] = useState(() =>
    isFloatingAdClosed(
      "cube",
      ad.id
    )
  );

  const layout =
    device === "desktop"
      ? ad.layout?.desktop
      : ad.layout?.mobile;

  if (closed) {
    return null;
  }

  const cubeFacesValue =
    getAdField<
      CubeAdFields,
      "cubeFaces"
    >(
      ad,
      "cubeFaces"
    );

  const cubeFaces =
    Array.isArray(cubeFacesValue)
      ? cubeFacesValue
      : [];

  if (!cubeFaces.length) {
    return null;
  }

  const configuredWidth =
    Number(
      getAdField<
        CubeAdFields,
        "width"
      >(
        ad,
        "width"
      )
    ) || 160;

  const safeWidth =
    clamp(
      configuredWidth,
      80,
      400
    );

  const {
    actualX,
    actualY,
    scale,
  } =
    getFloatingCoordinates(
      layout,
      device
    );

  const safeScale =
    clamp(
      scale,
      0.25,
      2
    );

  const handleClose = () => {
    markFloatingAdClosed(
      "cube",
      ad.id
    );

    setClosed(true);
  };

  return (
    <div
      className="infinia-floating-ad infinia-cube-ad"
      style={{
        position: "fixed",

        left: "50%",
        top: "50%",

        width: safeWidth + 30,
        height: safeWidth + 30,

        transform:
          `translate(-50%, -50%) ` +
          `translate(${actualX}px, ${actualY}px) ` +
          `scale(${safeScale})`,

        transformOrigin:
          "center center",

        zIndex: 99990,

        overflow: "visible",

        pointerEvents: "auto",
      }}
    >
      <AdCloseButton
        onClose={handleClose}
      />

      <CubeAdVisual
        faces={cubeFaces}
        size={safeWidth}
        rotationSpeed={
          Number(
            getAdField<
              CubeAdFields,
              "rotationSpeed"
            >(
              ad,
              "rotationSpeed"
            )
          ) || 4
        }
        openInNewTab={
          ad.openInNewTab !== false
        }
      />
    </div>
  );
}

// ======================================================
// CUBE VISUAL
// ======================================================

function CubeAdVisual({
  faces,
  size,
  rotationSpeed,
  openInNewTab,
}: {
  faces: Array<{
    image?: string;
    link?: string;
  }>;

  size: number;

  rotationSpeed: number;

  openInNewTab: boolean;
}) {
  const depth =
    size / 2;

  const transforms = [
    `rotateY(0deg) translateZ(${depth}px)`,

    `rotateY(90deg) translateZ(${depth}px)`,

    `rotateY(180deg) translateZ(${depth}px)`,

    `rotateY(-90deg) translateZ(${depth}px)`,
  ];

  return (
    <>
      <style>
        {`
          @keyframes infiniaCubeSpin {
            from {
              transform:
                rotateX(-8deg)
                rotateY(0deg);
            }

            to {
              transform:
                rotateX(-8deg)
                rotateY(360deg);
            }
          }

          .infinia-cube-stage {
            position: relative;

            width: 100%;
            height: 100%;

            display: flex;

            align-items: center;
            justify-content: center;

            transform-style: preserve-3d;

            -webkit-transform-style:
              preserve-3d;
          }

          .infinia-cube {
            position: relative;

            width: ${size}px;
            height: ${size}px;

            transform-style:
              preserve-3d;

            -webkit-transform-style:
              preserve-3d;

            animation:
              infiniaCubeSpin
              ${Math.max(
                rotationSpeed,
                1
              )}s
              linear
              infinite;
          }

          .infinia-cube-face {
            position: absolute;

            inset: 0;

            width: ${size}px;
            height: ${size}px;

            overflow: hidden;

            background: #111;

            backface-visibility:
              hidden;

            -webkit-backface-visibility:
              hidden;

            transform-style:
              preserve-3d;

            -webkit-transform-style:
              preserve-3d;

            box-shadow:
              0 20px 50px
              rgba(0,0,0,0.35);
          }

          .infinia-cube-face img {
            display: block;

            width: 100%;
            height: 100%;

            object-fit: cover;

            user-select: none;

            -webkit-user-drag: none;
          }
        `}
      </style>

      <div
        className="infinia-cube-stage"
        style={{
          width:
            size + 30,

          height:
            size + 30,

          perspective:
            "800px",
        }}
      >
        <div className="infinia-cube">
          {faces
            .slice(0, 4)
            .map(
              (
                face,
                index
              ) => {
                if (
                  !face?.image
                ) {
                  return null;
                }

                return (
                  <div
                    key={`${index}-${face.image}`}
                    className="infinia-cube-face"
                    style={{
                      transform:
                        transforms[
                          index
                        ],
                    }}
                  >
                    {face.link ? (
                      <a
                        href={
                          face.link
                        }
                        target={
                          openInNewTab
                            ? "_blank"
                            : "_self"
                        }
                        rel={
                          openInNewTab
                            ? "noopener noreferrer"
                            : undefined
                        }
                        aria-label={`Advertisement face ${
                          index + 1
                        }`}
                        style={{
                          display:
                            "block",

                          width:
                            "100%",

                          height:
                            "100%",
                        }}
                      >
                        <img
                          src={
                            face.image
                          }
                          alt={`Advertisement face ${
                            index + 1
                          }`}
                          draggable={
                            false
                          }
                        />
                      </a>
                    ) : (
                      <img
                        src={
                          face.image
                        }
                        alt={`Advertisement face ${
                          index + 1
                        }`}
                        draggable={
                          false
                        }
                      />
                    )}
                  </div>
                );
              }
            )}
        </div>
      </div>
    </>
  );
}




// ======================================================
// POPUP AD
// ======================================================

function PopupAd({
  ad,
  device,
  onClose,
}: {
  ad: BusinessAd;
  device: Device;
  onClose: () => void;
}) {
  const image =
    String(
      getAdField<
        {
          image?: string;
        },
        "image"
      >(
        ad,
        "image"
      ) || ""
    );

  const link =
    String(
      getAdField<
        {
          link?: string;
        },
        "link"
      >(
        ad,
        "link"
      ) || ""
    );

  const description =
    String(
      getAdField<
        {
          description?: string;
        },
        "description"
      >(
        ad,
        "description"
      ) || ""
    );

  const buttonText =
    String(
      getAdField<
        {
          buttonText?: string;
        },
        "buttonText"
      >(
        ad,
        "buttonText"
      ) || "Learn More"
    );

  const scale =
    Number(
      getAdField<
        PopupAdFields,
        "scale"
      >(
        ad,
        "scale"
      )
    ) || 1;

  const safeScale =
    clamp(
      scale,
      0.8,
      1.2
    );

  const isMobile =
    device === "mobile";

  // ----------------------------------------------------
  // ESC CLOSE
  // ----------------------------------------------------

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        "";
    };
  }, [onClose]);

  // ----------------------------------------------------
  // CLICK OUTSIDE
  // ----------------------------------------------------

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  };

  // ----------------------------------------------------
  // POPUP SIZE
  // ----------------------------------------------------

  const popupWidth = isMobile
    ? "calc(100vw - 28px)"
    : "min(720px, calc(100vw - 48px))";

  return (
    <>
      <style>
        {`
          @keyframes infiniaPopupBackdrop {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes infiniaPopupEnter {
            from {
              opacity: 0;
              transform:
                translateY(25px)
                scale(0.94);
            }

            to {
              opacity: 1;
              transform:
                translateY(0)
                scale(1);
            }
          }

          .infinia-popup-backdrop {
            position: fixed;
            inset: 0;

            z-index: 999999;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 14px;

            background:
              rgba(0, 0, 0, 0.72);

            backdrop-filter:
              blur(9px);

            -webkit-backdrop-filter:
              blur(9px);

            animation:
              infiniaPopupBackdrop
              0.25s ease-out;
          }

          .infinia-popup-card {
            position: relative;

            width: ${popupWidth};

            max-height:
              calc(100vh - 28px);

            overflow: hidden;

            border-radius:
              ${isMobile ? "18px" : "22px"};

            background:
              linear-gradient(
                145deg,
                #ffffff 0%,
                #f8fafc 100%
              );

            box-shadow:
              0 30px 100px
              rgba(0,0,0,0.5);

            animation:
              infiniaPopupEnter
              0.32s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              );

            transform:
              scale(${safeScale});

            transform-origin:
              center center;
          }

          .infinia-popup-image {
            display: block;

            width: 100%;

            height:
              ${isMobile
                ? "190px"
                : "320px"};

            object-fit: cover;

            background:
              #111827;
          }

          .infinia-popup-content {
            padding:
              ${isMobile
                ? "18px 18px 20px"
                : "24px 28px 26px"};
          }

          .infinia-popup-badge {
            display: inline-flex;

            align-items: center;

            padding:
              5px 10px;

            margin-bottom: 9px;

            border-radius: 999px;

            background:
              linear-gradient(
                135deg,
                #dc2626,
                #991b1b
              );

            color: #ffffff;

            font-size: 10px;

            font-weight: 800;

            letter-spacing:
              0.12em;

            text-transform:
              uppercase;
          }

          .infinia-popup-title {
            margin: 0;

            color: #111827;

            font-size:
              ${isMobile
                ? "21px"
                : "28px"};

            line-height: 1.2;

            font-weight: 800;

            letter-spacing:
              -0.02em;
          }

          .infinia-popup-description {
            margin:
              10px 0 0;

            color: #64748b;

            font-size:
              ${isMobile
                ? "14px"
                : "15px"};

            line-height: 1.55;
          }

          .infinia-popup-action {
            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;

            margin-top: 20px;
          }

          .infinia-popup-cta {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-height: 44px;

            padding:
              0 20px;

            border-radius: 10px;

            background:
              linear-gradient(
                135deg,
                #dc2626,
                #b91c1c
              );

            color: #ffffff;

            text-decoration: none;

            font-size: 14px;

            font-weight: 700;

            box-shadow:
              0 8px 22px
              rgba(185,28,28,0.28);

            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .infinia-popup-cta:hover {
            transform:
              translateY(-2px);

            box-shadow:
              0 12px 28px
              rgba(185,28,28,0.35);
          }

          .infinia-popup-ad-label {
            color: #94a3b8;

            font-size: 10px;

            letter-spacing:
              0.08em;

            text-transform:
              uppercase;
          }

          .infinia-popup-close {
            position: absolute;

            top: 12px;
            right: 12px;

            z-index: 10;

            width: 40px;
            height: 40px;

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 0;

            border:
              1px solid
              rgba(255,255,255,0.8);

            border-radius: 50%;

            background:
              rgba(0,0,0,0.68);

            color: #ffffff;

            cursor: pointer;

            box-shadow:
              0 5px 18px
              rgba(0,0,0,0.28);

            backdrop-filter:
              blur(8px);

            -webkit-backdrop-filter:
              blur(8px);

            transition:
              transform 0.2s ease,
              background 0.2s ease;
          }

          .infinia-popup-close:hover {
            transform:
              rotate(90deg)
              scale(1.05);

            background:
              rgba(0,0,0,0.9);
          }

          @media (max-width: 480px) {
            .infinia-popup-backdrop {
              padding: 10px;
            }

            .infinia-popup-card {
              max-height:
                calc(100vh - 20px);
            }

            .infinia-popup-image {
              height: 175px;
            }

            .infinia-popup-action {
              flex-direction: column;
              align-items: stretch;
            }

            .infinia-popup-cta {
              width: 100%;
            }

            .infinia-popup-ad-label {
              text-align: center;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .infinia-popup-backdrop,
            .infinia-popup-card {
              animation: none;
            }

            .infinia-popup-cta,
            .infinia-popup-close {
              transition: none;
            }
          }
        `}
      </style>

      <div
        className="infinia-popup-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label={
          ad.title ||
          "Advertisement"
        }
        onMouseDown={
          handleBackdropClick
        }
      >
        <div
          className="infinia-popup-card"
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          {/* CLOSE */}

          <button
            type="button"
            className="infinia-popup-close"
            onClick={onClose}
            aria-label="Close advertisement"
            title="Close advertisement"
          >
            <X
              size={21}
              strokeWidth={2.6}
            />
          </button>

          {/* IMAGE */}

          {image && (
            <>
              {link ? (
                <a
                  href={link}
                  target={
                    ad.openInNewTab !== false
                      ? "_blank"
                      : "_self"
                  }
                  rel={
                    ad.openInNewTab !== false
                      ? "noopener noreferrer"
                      : undefined
                  }
                  style={{
                    display: "block",
                  }}
                >
                  <img
                    src={image}
                    alt={
                      ad.title ||
                      "Advertisement"
                    }
                    className="infinia-popup-image"
                  />
                </a>
              ) : (
                <img
                  src={image}
                  alt={
                    ad.title ||
                    "Advertisement"
                  }
                  className="infinia-popup-image"
                />
              )}
            </>
          )}

          {/* CONTENT */}

          <div className="infinia-popup-content">

            <h2 className="infinia-popup-title">
              {ad.title ||
                "Special Offer"}
            </h2>

            {description && (
              <p className="infinia-popup-description">
                {description}
              </p>
            )}

            <div className="infinia-popup-action">
              <span className="infinia-popup-ad-label">
                Sponsored
              </span>

              {link && (
                <a
                  href={link}
                  target={
                    ad.openInNewTab !== false
                      ? "_blank"
                      : "_self"
                  }
                  rel={
                    ad.openInNewTab !== false
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="infinia-popup-cta"
                >
                  {buttonText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// ======================================================
// FLOATING TV
// ======================================================

function FloatingTVAd({
  ad,
  device,
}: {
  ad: BusinessAd;
  device: Device;
}) {
  const [
    closed,
    setClosed,
  ] = useState(() =>
    isFloatingAdClosed(
      "floating_tv",
      ad.id
    )
  );

  if (closed) {
    return null;
  }

  const layout =
    device === "desktop"
      ? ad.layout?.desktop
      : ad.layout?.mobile;

  const {
    actualX,
    actualY,
    scale,
  } =
    getFloatingCoordinates(
      layout,
      device
    );

  // ====================================================
  // WIDTH
  // ====================================================

  const configuredWidth =
    Number(
      getAdField<
        FloatingTVFields,
        "width"
      >(
        ad,
        "width"
      )
    ) || 320;

  const width =
    clamp(
      configuredWidth,
      180,
      800
    );

  // ====================================================
  // HEIGHT
  // ====================================================

  const height =
    Math.round(
      width * 0.5625
    );

  // ====================================================
  // SCALE
  // ====================================================

  const safeScale =
    clamp(
      scale,
      0.25,
      2
    );

  // ====================================================
  // VIDEO DATA
  // ====================================================

  const videoUrl =
    String(
      getAdField<
        FloatingTVFields,
        "videoUrl"
      >(
        ad,
        "videoUrl"
      ) || ""
    );

  const autoplay =
    getAdField<
      FloatingTVFields,
      "autoplay"
    >(
      ad,
      "autoplay"
    ) !== false;

  const muted =
    getAdField<
      FloatingTVFields,
      "muted"
    >(
      ad,
      "muted"
    ) !== false;

  const videoPoster =
    getAdField<
      FloatingTVFields,
      "videoPoster"
    >(
      ad,
      "videoPoster"
    );

  const youtubeId =
    getYouTubeId(
      videoUrl
    );

  // ====================================================
  // CLOSE
  // ====================================================

  const handleClose = () => {
    markFloatingAdClosed(
      "floating_tv",
      ad.id
    );

    setClosed(true);
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div
      style={{
        position: "fixed",

        left:
          `calc(50% + ${actualX}px)`,

        top:
          `calc(50% + ${actualY}px)`,

        width,

        height,

        transform:
          `translate(-50%, -50%) ` +
          `scale(${safeScale})`,

        transformOrigin:
          "center center",

        zIndex: 99990,

        overflow: "visible",

        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        aria-label="Close advertisement"
        title="Close advertisement"
        onClick={(event) => {
          event.preventDefault();

          event.stopPropagation();

          handleClose();
        }}
        style={{
          position: "absolute",

          top: -18,
          right: -18,

          width: 42,
          height: 42,

          padding: 0,

          display: "flex",

          alignItems: "center",

          justifyContent:
            "center",

          border:
            "2px solid rgba(255,255,255,0.9)",

          borderRadius: "50%",

          background:
            "rgba(0,0,0,0.88)",

          color: "#fff",

          cursor: "pointer",

          zIndex: 100000,

          boxShadow:
            "0 5px 18px rgba(0,0,0,0.45)",

          backdropFilter:
            "blur(6px)",

          WebkitBackdropFilter:
            "blur(6px)",

          pointerEvents: "auto",
        }}
      >
        <X
          size={24}
          strokeWidth={2.8}
        />
      </button>

      <div
        style={{
          position: "relative",

          width: "100%",
          height: "100%",

          overflow: "hidden",

          borderRadius: 16,

          background: "#000",

          boxShadow:
            "0 25px 70px rgba(0,0,0,0.35)",
        }}
      >
        {youtubeId ? (
          <iframe
            src={
              `https://www.youtube.com/embed/${youtubeId}` +
              `?autoplay=${
                autoplay ? 1 : 0
              }` +
              `&mute=${
                muted ? 1 : 0
              }` +
              `&controls=1` +
              `&rel=0` +
              `&playsinline=1`
            }
            title={
              ad.title ||
              "Floating Advertisement"
            }
            style={{
              width: "100%",

              height: "100%",

              border: 0,

              display: "block",
            }}
            allow={
              "autoplay; encrypted-media; " +
              "picture-in-picture; fullscreen"
            }
            allowFullScreen
          />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            poster={
              videoPoster ||
              undefined
            }
            autoPlay={autoplay}
            muted={muted}
            loop
            playsInline
            controls
            style={{
              width: "100%",

              height: "100%",

              objectFit: "cover",

              display: "block",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

// ======================================================
// YOUTUBE ID EXTRACTOR
// ======================================================

function getYouTubeId(
  url: string
): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed =
      new URL(url);

    const hostname =
      parsed.hostname
        .toLowerCase()
        .replace(
          /^www\./,
          ""
        );

    // ==================================================
    // youtu.be/VIDEO_ID
    // ==================================================

    if (
      hostname ===
      "youtu.be"
    ) {
      return (
        parsed.pathname
          .split("/")
          .filter(Boolean)[0] ||
        null
      );
    }

    // ==================================================
    // youtube.com
    // ==================================================

    if (
      hostname ===
        "youtube.com" ||
      hostname ===
        "m.youtube.com"
    ) {
      // ------------------------------------------------
      // youtube.com/watch?v=ID
      // ------------------------------------------------

      const v =
        parsed.searchParams.get(
          "v"
        );

      if (v) {
        return v;
      }

      // ------------------------------------------------
      // youtube.com/shorts/ID
      // ------------------------------------------------

      const shorts =
        parsed.pathname.match(
          /^\/shorts\/([^/?]+)/
        );

      if (shorts) {
        return shorts[1];
      }

      // ------------------------------------------------
      // youtube.com/embed/ID
      // ------------------------------------------------

      const embed =
        parsed.pathname.match(
          /^\/embed\/([^/?]+)/
        );

      if (embed) {
        return embed[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

