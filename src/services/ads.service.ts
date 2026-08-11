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
// AD POSITIONS
// ======================================================

export type AdPosition =
  | "homepage_top"
  | "homepage_middle"
  | "homepage_bottom"
  | "article_top"
  | "article_after_intro"
  | "article_middle"
  | "article_before_related"
  | "sidebar_top"
  | "sidebar_middle"
  | "sidebar_bottom"
  | "shorts_between"
  | "shorts_after_3"
  | "global_popup"
  | "page_transition"
  | "floating_tv"
  | "sticky_bottom";

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
// ONLY SCALE
//
// Used by:
// banner
// native
// popup
// page_transition
// shorts_video
// sticky_bottom
// ======================================================

export interface NormalDeviceLayout {
  scale: number;
}

export interface NormalAdLayout {
  desktop: NormalDeviceLayout;
  mobile: NormalDeviceLayout;
}

// ======================================================
// FLOATING DEVICE LAYOUT
//
// X/Y POSITIONING IS ONLY AVAILABLE FOR:
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
// ======================================================

interface CommonAdData {
  title: string;

  type: AdType;

  position: AdPosition;

  active: boolean;

  priority?: number;

  mobileEnabled?: boolean;

  desktopEnabled?: boolean;

  openInNewTab?: boolean;

  layout?:
    | NormalAdLayout
    | FloatingAdLayout;

  createdAt?: unknown;

  updatedAt?: unknown;
}

// ======================================================
// BANNER
// ======================================================

export interface BannerAd
  extends CommonAdData {
  type: "banner";

  image: string;

  link: string;
}

// ======================================================
// NATIVE
// ======================================================

export interface NativeAd
  extends CommonAdData {
  type: "native";

  image: string;

  link: string;
}

// ======================================================
// POPUP
// ======================================================

export interface PopupAd
  extends CommonAdData {
  type: "popup";

  image: string;

  link: string;

  delay?: number;

  frequency?: AdFrequency;

  closeable?: boolean;
}

// ======================================================
// PAGE TRANSITION
// ======================================================

export interface PageTransitionAd
  extends CommonAdData {
  type: "page_transition";

  image: string;

  link: string;

  delay?: number;

  frequency?: AdFrequency;

  closeable?: boolean;
}

// ======================================================
// STICKY BOTTOM
// ======================================================

export interface StickyBottomAd
  extends CommonAdData {
  type: "sticky_bottom";

  image: string;

  link: string;

  closeable?: boolean;
}

// ======================================================
// SHORTS VIDEO
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
// X/Y POSITIONING ENABLED
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
}

// ======================================================
// 3D CUBE
//
// X/Y POSITIONING ENABLED
// ======================================================

export interface CubeAd
  extends CommonAdData {
  type: "cube";

  cubeFaces: AdCubeFace[];

  rotationSpeed?: number;

  cubeSameImage?: boolean;

  width?: number;
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
// ONLY SCALE
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
        typeof layout.desktop?.scale ===
        "number"
          ? layout.desktop.scale
          : 1,
    },

    mobile: {
      scale:
        typeof layout.mobile?.scale ===
        "number"
          ? layout.mobile.scale
          : 1,
    },
  };
}

// ======================================================
// FLOATING LAYOUT SANITIZER
//
// X/Y ONLY FOR CUBE + FLOATING TV
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
        typeof layout.desktop?.width ===
        "number"
          ? layout.desktop.width
          : 160,

      height:
        typeof layout.desktop?.height ===
        "number"
          ? layout.desktop.height
          : 160,

      x:
        typeof layout.desktop?.x ===
        "number"
          ? layout.desktop.x
          : 0,

      y:
        typeof layout.desktop?.y ===
        "number"
          ? layout.desktop.y
          : 0,

      scale:
        typeof layout.desktop?.scale ===
        "number"
          ? layout.desktop.scale
          : 1,
    },

    mobile: {
      width:
        typeof layout.mobile?.width ===
        "number"
          ? layout.mobile.width
          : 140,

      height:
        typeof layout.mobile?.height ===
        "number"
          ? layout.mobile.height
          : 140,

      x:
        typeof layout.mobile?.x ===
        "number"
          ? layout.mobile.x
          : 0,

      y:
        typeof layout.mobile?.y ===
        "number"
          ? layout.mobile.y
          : 0,

      scale:
        typeof layout.mobile?.scale ===
        "number"
          ? layout.mobile.scale
          : 1,
    },
  };
}

// ======================================================
// SANITIZE AD DATA
//
// This is the most important part.
//
// Irrelevant attributes are NOT written.
// ======================================================

function sanitizeAd(
  data: AdsData
): AdsData {
  const common = {
    title: data.title || "",
    type: data.type,
    position: data.position,
    active: data.active ?? true,

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

      layout:
        sanitizeNormalLayout(
          data.layout as
            | NormalAdLayout
            | undefined
        ),
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

      layout:
        sanitizeNormalLayout(
          data.layout as
            | NormalAdLayout
            | undefined
        ),
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
          data.layout as
            | NormalAdLayout
            | undefined
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
          data.layout as
            | NormalAdLayout
            | undefined
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
        sanitizeNormalLayout(
          data.layout as
            | NormalAdLayout
            | undefined
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

      layout:
        sanitizeNormalLayout(
          data.layout as
            | NormalAdLayout
            | undefined
        ),
    };
  }

  // ====================================================
  // FLOATING TV
  //
  // X/Y ALLOWED
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
          data.layout as
            | FloatingAdLayout
            | undefined
        ),
    };
  }

  // ====================================================
  // 3D CUBE
  //
  // X/Y ALLOWED
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
          data.layout as
            | FloatingAdLayout
            | undefined
        ),
    };
  }

  // ====================================================
  // FALLBACK
  // ====================================================

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

  return docRef.id;
}

// ======================================================
// GET ALL ADS
//
// Reads every type collection.
// ======================================================

export async function getAds(): Promise<
  BusinessAd[]
> {
  const snapshots =
    await Promise.all(
      (
        [
          "banner",
          "cube",
          "popup",
          "page_transition",
          "shorts_video",
          "floating_tv",
          "sticky_bottom",
          "native",
        ] as AdType[]
      ).map(
        (type) =>
          getDocs(
            getTypeCollection(type)
          )
      )
    );

  const ads: BusinessAd[] = [];

  snapshots.forEach(
    (snapshot) => {
      snapshot.docs.forEach(
        (item) => {
          ads.push({
            id: item.id,
            ...(item.data() as AdsData),
          });
        }
      );
    }
  );

  return ads;
}

// ======================================================
// GET ADS BY TYPE
// ======================================================

export async function getAdsByType(
  type: AdType
): Promise<BusinessAd[]> {
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
}

// ======================================================
// GET SINGLE AD
//
// Since type is part of the path,
// type is required.
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
//
// Type is required because it determines
// which subcollection the document belongs to.
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
}

// ======================================================
// OPTIONAL HELPER
// ======================================================
//
// Useful when checking whether an ad supports
// free X/Y positioning.
// ======================================================

export function supportsFreePosition(
  type: AdType
): boolean {
  return isFloatingAdType(type);
}

