// ======================================================
// ADS SERVICE
// Collection:
// businessAds/{type}/ads/{adId}
// ======================================================

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

// ======================================================
// ROOT COLLECTION
// ======================================================

const ROOT_COLLECTION = "businessAds";

const ADS_SUBCOLLECTION = "ads";

// ======================================================
// AD TYPES
// ======================================================

export type AdType =
  | "banner"
  | "cube"
  | "popup"
  | "page_transition"
  | "shorts_video"
  | "floating_tv"
  | "sticky_bottom"
  | "native";

// ======================================================
// FREQUENCY
// ======================================================

export type AdFrequency =
  | "always"
  | "once_session"
  | "once_day"
  | "once";

// ======================================================
// VIDEO TYPE
// ======================================================

export type AdVideoType =
  | "youtube"
  | "mp4";

// ======================================================
// VIDEO ORIENTATION
// ======================================================

export type AdVideoOrientation =
  | "vertical"
  | "horizontal"
  | "auto";

// ======================================================
// CUBE FACE
// ======================================================

export interface AdCubeFace {
  image: string;
  link: string;
}

// ======================================================
// NORMAL AD LAYOUT
//
// SCALE ONLY
//
// Used by:
// popup
// page_transition
// ======================================================

export interface NormalDeviceLayout {
  scale: number;
}

export interface NormalAdLayout {
  desktop: NormalDeviceLayout;
  mobile: NormalDeviceLayout;
}

// ======================================================
// STICKY BOTTOM LAYOUT
//
// WIDTH + HEIGHT ONLY
//
// NO X/Y
// NO SCALE
// ======================================================

export interface StickyBottomDeviceLayout {
  width: number;
  height: number;
}

export interface StickyBottomAdLayout {
  desktop: StickyBottomDeviceLayout;
  mobile: StickyBottomDeviceLayout;
}

// ======================================================
// FLOATING DEVICE LAYOUT
//
// X/Y + SCALE ONLY FOR:
// cube
// floating_tv
// ======================================================

export interface FloatingDeviceLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
}

export interface FloatingAdLayout {
  desktop: FloatingDeviceLayout;
  mobile: FloatingDeviceLayout;
}

// ======================================================
// COMMON AD DATA
//
// NO POSITION FIELD
// ======================================================

interface CommonAdData {
  title: string;

  type: AdType;

  active: boolean;

  priority?: number;

  mobileEnabled?: boolean;

  desktopEnabled?: boolean;

  openInNewTab?: boolean;

  createdAt?: unknown;

  updatedAt?: unknown;
}

// ======================================================
// BANNER
//
// NO LAYOUT
// NO SCALE
// NO POSITION
// ======================================================

export interface BannerAd
  extends CommonAdData {
  type: "banner";

  image: string;

  link: string;
}

// ======================================================
// NATIVE
//
// NO LAYOUT
// NO SCALE
// NO POSITION
// ======================================================

export interface NativeAd
  extends CommonAdData {
  type: "native";

  image: string;

  link: string;
}

// ======================================================
// POPUP
//
// SCALE AVAILABLE
// ======================================================

export interface PopupAd
  extends CommonAdData {
  type: "popup";

  image: string;

  link: string;

  delay?: number;

  frequency?: AdFrequency;

  closeable?: boolean;

  layout?: NormalAdLayout;
}

// ======================================================
// PAGE TRANSITION
//
// SCALE AVAILABLE
// ======================================================

export interface PageTransitionAd
  extends CommonAdData {
  type: "page_transition";

  image: string;

  link: string;

  delay?: number;

  frequency?: AdFrequency;

  closeable?: boolean;

  layout?: NormalAdLayout;
}

// ======================================================
// STICKY BOTTOM
//
// WIDTH + HEIGHT ONLY
//
// NO X/Y
// NO SCALE
// ======================================================

export interface StickyBottomAd
  extends CommonAdData {
  type: "sticky_bottom";

  image: string;

  link: string;

  closeable?: boolean;

  layout?: StickyBottomAdLayout;
}

// ======================================================
// SHORTS VIDEO
//
// NO LAYOUT
// NO SCALE
// NO POSITION
// ======================================================

export interface ShortsVideoAd
  extends CommonAdData {
  type: "shorts_video";

  image?: string;

  videoUrl: string;

  videoType: AdVideoType;

  videoOrientation: AdVideoOrientation;

  videoPoster?: string;

  duration?: number;

  autoplay?: boolean;

  muted?: boolean;
}

// ======================================================
// FLOATING TV
//
// X/Y + SCALE ENABLED
// ======================================================

export interface FloatingTvAd
  extends CommonAdData {
  type: "floating_tv";

  videoUrl?: string;

  videoType?: AdVideoType;

  videoOrientation?: AdVideoOrientation;

  videoPoster?: string;

  duration?: number;

  autoplay?: boolean;

  muted?: boolean;

  width?: number;

  layout?: FloatingAdLayout;
}

// ======================================================
// 3D CUBE
//
// X/Y + SCALE ENABLED
// ======================================================

export interface CubeAd
  extends CommonAdData {
  type: "cube";

  cubeFaces: AdCubeFace[];

  rotationSpeed?: number;

  cubeSameImage?: boolean;

  width?: number;

  layout?: FloatingAdLayout;
}

// ======================================================
// UNION
// ======================================================

export type AdsData =
  | BannerAd
  | CubeAd
  | PopupAd
  | PageTransitionAd
  | ShortsVideoAd
  | FloatingTvAd
  | StickyBottomAd
  | NativeAd;

// ======================================================
// FIRESTORE RESULT
// ======================================================

export type BusinessAd =
  AdsData & {
    id: string;
  };

// ======================================================
// TYPE GUARDS
// ======================================================

function isFloatingAdType(
  type: AdType
): type is "cube" | "floating_tv" {
  return (
    type === "cube" ||
    type === "floating_tv"
  );
}

// ======================================================
// TYPE COLLECTION PATH
// ======================================================

function getTypeCollection(
  type: AdType
) {
  return collection(
    db,
    ROOT_COLLECTION,
    type,
    ADS_SUBCOLLECTION
  );
}

// ======================================================
// NORMAL LAYOUT SANITIZER
//
// ONLY POPUP + PAGE TRANSITION
// ======================================================

function sanitizeNormalLayout(
  layout?: NormalAdLayout
): NormalAdLayout | undefined {
  if (!layout) {
    return undefined;
  }

  return {
    desktop: {
      scale:
        typeof layout.desktop?.scale === "number"
          ? layout.desktop.scale
          : 1,
    },

    mobile: {
      scale:
        typeof layout.mobile?.scale === "number"
          ? layout.mobile.scale
          : 1,
    },
  };
}

// ======================================================
// STICKY BOTTOM LAYOUT SANITIZER
//
// WIDTH + HEIGHT ONLY
// ======================================================

function sanitizeStickyBottomLayout(
  layout?: StickyBottomAdLayout
): StickyBottomAdLayout {
  return {
    desktop: {
      width:
        typeof layout?.desktop?.width === "number"
          ? layout.desktop.width
          : 1100,

      height:
        typeof layout?.desktop?.height === "number"
          ? layout.desktop.height
          : 92,
    },

    mobile: {
      width:
        typeof layout?.mobile?.width === "number"
          ? layout.mobile.width
          : 440,

      height:
        typeof layout?.mobile?.height === "number"
          ? layout.mobile.height
          : 72,
    },
  };
}

// ======================================================
// FLOATING LAYOUT SANITIZER
//
// X/Y + SCALE ONLY FOR CUBE + FLOATING TV
// ======================================================

function sanitizeFloatingLayout(
  layout?: FloatingAdLayout
): FloatingAdLayout | undefined {
  if (!layout) {
    return undefined;
  }

  return {
    desktop: {
      width:
        typeof layout.desktop?.width === "number"
          ? layout.desktop.width
          : 160,

      height:
        typeof layout.desktop?.height === "number"
          ? layout.desktop.height
          : 160,

      x:
        typeof layout.desktop?.x === "number"
          ? layout.desktop.x
          : 0,

      y:
        typeof layout.desktop?.y === "number"
          ? layout.desktop.y
          : 0,

      scale:
        typeof layout.desktop?.scale === "number"
          ? layout.desktop.scale
          : 1,
    },

    mobile: {
      width:
        typeof layout.mobile?.width === "number"
          ? layout.mobile.width
          : 140,

      height:
        typeof layout.mobile?.height === "number"
          ? layout.mobile.height
          : 140,

      x:
        typeof layout.mobile?.x === "number"
          ? layout.mobile.x
          : 0,

      y:
        typeof layout.mobile?.y === "number"
          ? layout.mobile.y
          : 0,

      scale:
        typeof layout.mobile?.scale === "number"
          ? layout.mobile.scale
          : 1,
    },
  };
}

// ======================================================
// SANITIZE AD DATA
//
// POSITION IS NOT STORED.
// ======================================================

function sanitizeAd(
  data: AdsData
): AdsData {
  const common = {
    title: data.title || "",

    type: data.type,

    active:
      data.active ?? true,

    priority:
      data.priority ?? 1,

    mobileEnabled:
      data.mobileEnabled ?? true,

    desktopEnabled:
      data.desktopEnabled ?? true,

    openInNewTab:
      data.openInNewTab ?? true,
  };

  // ====================================================
  // BANNER
  // ====================================================

  if (data.type === "banner") {
    return {
      ...common,

      type: "banner",

      image: data.image || "",

      link: data.link || "",
    };
  }

  // ====================================================
  // NATIVE
  // ====================================================

  if (data.type === "native") {
    return {
      ...common,

      type: "native",

      image: data.image || "",

      link: data.link || "",
    };
  }

  // ====================================================
  // POPUP
  // ====================================================

  if (data.type === "popup") {
    return {
      ...common,

      type: "popup",

      image: data.image || "",

      link: data.link || "",

      delay:
        data.delay ?? 5,

      frequency:
        data.frequency ??
        "once_session",

      closeable:
        data.closeable ?? true,

      layout:
        sanitizeNormalLayout(
          data.layout
        ),
    };
  }

  // ====================================================
  // PAGE TRANSITION
  // ====================================================

  if (
    data.type ===
    "page_transition"
  ) {
    return {
      ...common,

      type: "page_transition",

      image: data.image || "",

      link: data.link || "",

      delay:
        data.delay ?? 5,

      frequency:
        data.frequency ??
        "once_session",

      closeable:
        data.closeable ?? true,

      layout:
        sanitizeNormalLayout(
          data.layout
        ),
    };
  }

  // ====================================================
  // STICKY BOTTOM
  // ====================================================

  if (
    data.type ===
    "sticky_bottom"
  ) {
    return {
      ...common,

      type: "sticky_bottom",

      image: data.image || "",

      link: data.link || "",

      closeable:
        data.closeable ?? true,

      layout:
        sanitizeStickyBottomLayout(
          data.layout
        ),
    };
  }

  // ====================================================
  // SHORTS VIDEO
  // ====================================================

  if (
    data.type ===
    "shorts_video"
  ) {
    return {
      ...common,

      type: "shorts_video",

      ...(data.image
        ? {
            image: data.image,
          }
        : {}),

      videoUrl:
        data.videoUrl || "",

      videoType:
        data.videoType ??
        "youtube",

      videoOrientation:
        data.videoOrientation ??
        "auto",

      ...(data.videoPoster
        ? {
            videoPoster:
              data.videoPoster,
          }
        : {}),

      duration:
        data.duration ?? 10,

      autoplay:
        data.autoplay ?? true,

      muted:
        data.muted ?? true,
    };
  }

  // ====================================================
  // FLOATING TV
  //
  // X/Y + SCALE
  // ====================================================

  if (
    data.type ===
    "floating_tv"
  ) {
    return {
      ...common,

      type: "floating_tv",

      ...(data.videoUrl
        ? {
            videoUrl:
              data.videoUrl,
          }
        : {}),

      videoType:
        data.videoType ??
        "youtube",

      videoOrientation:
        data.videoOrientation ??
        "auto",

      ...(data.videoPoster
        ? {
            videoPoster:
              data.videoPoster,
          }
        : {}),

      duration:
        data.duration ?? 10,

      autoplay:
        data.autoplay ?? true,

      muted:
        data.muted ?? true,

      width:
        data.width ?? 320,

      layout:
        sanitizeFloatingLayout(
          data.layout
        ),
    };
  }

  // ====================================================
  // 3D CUBE
  //
  // X/Y + SCALE
  // ====================================================

  if (data.type === "cube") {
    return {
      ...common,

      type: "cube",

      cubeFaces:
        data.cubeFaces ?? [],

      rotationSpeed:
        data.rotationSpeed ?? 4,

      cubeSameImage:
        data.cubeSameImage ??
        false,

      width:
        data.width ?? 160,

      layout:
        sanitizeFloatingLayout(
          data.layout
        ),
    };
  }

  return data;
}

// ======================================================
// CREATE AD
// ======================================================

export async function createAd(
  data: AdsData
): Promise<string> {
  const payload =
    sanitizeAd(data);

  const docRef =
    await addDoc(
      getTypeCollection(
        payload.type
      ),
      {
        ...payload,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      }
    );

  // Sync after Firestore succeeds
  await syncAdsToGitHub();

  return docRef.id;
}

// ======================================================
// GET ALL ADS
// ======================================================

const GITHUB_ADS_URL =
  "https://raw.githubusercontent.com/javadeveloperarpit/Infinia_Bharat_News/main/public/data/ads.json";

// ======================================================
// GET ALL ADS
//
// ADMIN ONLY
// Source: Firebase Firestore
//
// Collection:
// businessAds/{type}/ads/{adId}
// ======================================================

export async function getAds(): Promise<BusinessAd[]> {
  try {
    const types: AdType[] = [
      "banner",
      "cube",
      "popup",
      "page_transition",
      "shorts_video",
      "floating_tv",
      "sticky_bottom",
      "native",
    ];

    const results =
      await Promise.all(
        types.map(async (type) => {
          const snapshot =
            await getDocs(
              getTypeCollection(type)
            );

          return snapshot.docs.map(
            (item) => ({
              id: item.id,
              ...(item.data() as AdsData),
            })
          );
        })
      );

    const ads =
      results.flat();

    return ads
      .filter(
        (ad) =>
          ad &&
          ad.active === true
      )
      .sort(
        (a, b) =>
          (b.priority ?? 1) -
          (a.priority ?? 1)
      );

  } catch (error) {
    console.error(
      "Failed to load ads from Firebase:",
      error
    );

    return [];
  }
}
// ======================================================
// GET ADS BY TYPE
//
// ADMIN ONLY
// Source: Firebase Firestore
// ======================================================

export async function getAdsByType(
  type: AdType
): Promise<BusinessAd[]> {
  try {
    const snapshot =
      await getDocs(
        getTypeCollection(type)
      );

    return snapshot.docs
      .map(
        (item) => ({
          id: item.id,
          ...(item.data() as AdsData),
        })
      )
      .filter(
        (ad) =>
          ad &&
          ad.active === true
      )
      .sort(
        (a, b) =>
          (b.priority ?? 1) -
          (a.priority ?? 1)
      );

  } catch (error) {
    console.error(
      `Failed to load ${type} ads from Firebase:`,
      error
    );

    return [];
  }
}

// ======================================================
// GET SINGLE AD
// ======================================================

export async function getAd(
  type: AdType,
  id: string
): Promise<BusinessAd | null> {
  const snapshot =
    await getDoc(
      doc(
        db,
        ROOT_COLLECTION,
        type,
        ADS_SUBCOLLECTION,
        id
      )
    );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as AdsData),
  };
}

// ======================================================
// UPDATE AD
// ======================================================

export async function updateAd(
  type: AdType,
  id: string,
  data: Partial<AdsData>
): Promise<void> {
  const existing =
    await getAd(type, id);

  if (!existing) {
    throw new Error(
      `Advertisement not found: ${type}/${id}`
    );
  }

  const merged =
    sanitizeAd({
      ...existing,
      ...data,
      type,
    } as AdsData);

  await updateDoc(
    doc(
      db,
      ROOT_COLLECTION,
      type,
      ADS_SUBCOLLECTION,
      id
    ),
    {
      ...merged,

      updatedAt:
        serverTimestamp(),
    }
  );
  await syncAdsToGitHub();
}


// ======================================================
// DELETE AD
// ======================================================

export async function deleteAd(
  type: AdType,
  id: string
): Promise<void> {
  await deleteDoc(
    doc(
      db,
      ROOT_COLLECTION,
      type,
      ADS_SUBCOLLECTION,
      id
    )
  );

  await syncAdsToGitHub();
}

// ======================================================
// OPTIONAL HELPER
//
// Only checks whether the ad supports
// free X/Y positioning.
// ======================================================

export function supportsFreePosition(
  type: AdType
): boolean {
  return isFloatingAdType(type);
}
// ======================================================
// GITHUB SYNC
// ======================================================

async function syncAdsToGitHub(): Promise<void> {
  try {
    const response = await fetch(
      "/api/admin/github/sync-ads",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result?.message ||
          "GitHub ads sync failed"
      );
    }

    console.log(
      "Ads synced to GitHub:",
      result
    );
  } catch (error) {
    console.error(
      "GitHub ads sync failed:",
      error
    );

    // IMPORTANT:
    // Firestore operation should NOT fail
    // just because GitHub sync failed.
  }
}