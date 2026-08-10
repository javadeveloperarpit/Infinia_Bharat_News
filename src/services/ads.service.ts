// ======================================================
// ADS SERVICE
// Collection: businessAds
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
// COLLECTION
// ======================================================

const COLLECTION = "businessAds";

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
// DEVICE LAYOUT
// ======================================================

export interface DeviceLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
}

// ======================================================
// RESPONSIVE LAYOUT
// ======================================================

export interface AdLayout {
  desktop: DeviceLayout;
  mobile: DeviceLayout;
}

// ======================================================
// ADS DATA
// ======================================================

export interface AdsData {
  // ----------------------------------------------------
  // BASIC
  // ----------------------------------------------------

  title: string;

  type: AdType;

  // ----------------------------------------------------
  // IMAGE
  // ----------------------------------------------------
  //
  // Used by:
  // banner
  // popup
  // native
  // sticky_bottom
  // page_transition
  //
  // Also usable as thumbnail/poster for shorts.
  //

  image: string;

  // ----------------------------------------------------
  // DESTINATION
  // ----------------------------------------------------

  link: string;

  // ----------------------------------------------------
  // POSITION
  // ----------------------------------------------------

  position: AdPosition;

  // ----------------------------------------------------
  // STATUS
  // ----------------------------------------------------

  active: boolean;

  priority?: number;

  // ----------------------------------------------------
  // DEVICE TARGETING
  // ----------------------------------------------------

  mobileEnabled?: boolean;

  desktopEnabled?: boolean;

  openInNewTab?: boolean;

  // ----------------------------------------------------
  // POPUP / PAGE TRANSITION
  // ----------------------------------------------------

  delay?: number;

  frequency?: AdFrequency;

  closeable?: boolean;

  // ----------------------------------------------------
  // VIDEO
  // ----------------------------------------------------

  videoUrl?: string;

  videoType?: AdVideoType;

  /**
   * Shorts video can be:
   *
   * vertical   = 9:16
   * horizontal = 16:9
   * auto       = source decides
   */
  videoOrientation?: AdVideoOrientation;

  /**
   * Optional image/poster for video ads.
   */
  videoPoster?: string;

  duration?: number;

  autoplay?: boolean;

  muted?: boolean;

  // ----------------------------------------------------
  // FLOATING TV
  // ----------------------------------------------------

  width?: number;

  // ----------------------------------------------------
  // 3D CUBE
  // ----------------------------------------------------

  cubeFaces?: AdCubeFace[];

  rotationSpeed?: number;

  cubeSameImage?: boolean;

  // ----------------------------------------------------
  // RESPONSIVE POSITIONING
  // ----------------------------------------------------

  layout?: AdLayout;

  // ----------------------------------------------------
  // FIRESTORE
  // ----------------------------------------------------

  createdAt?: unknown;

  updatedAt?: unknown;
}

// ======================================================
// FIRESTORE RESULT
// ======================================================

export interface BusinessAd
  extends AdsData {
  id: string;
}

// ======================================================
// CREATE AD
// ======================================================

export async function createAd(
  data: AdsData
): Promise<string> {
  const payload: AdsData = {
    ...data,

    priority:
      data.priority ?? 1,

    mobileEnabled:
      data.mobileEnabled ?? true,

    desktopEnabled:
      data.desktopEnabled ?? true,

    openInNewTab:
      data.openInNewTab ?? true,

    delay:
      data.delay ?? 5,

    frequency:
      data.frequency ?? "once_session",

    closeable:
      data.closeable ?? true,

    duration:
      data.duration ?? 10,

    autoplay:
      data.autoplay ?? true,

    muted:
      data.muted ?? true,

    width:
      data.width ?? 320,

    videoType:
      data.videoType ?? "youtube",

    videoOrientation:
      data.videoOrientation ?? "auto",

    videoPoster:
      data.videoPoster ?? "",

    rotationSpeed:
      data.rotationSpeed ?? 4,

    cubeSameImage:
      data.cubeSameImage ?? false,
  };

  const docRef =
    await addDoc(
      collection(
        db,
        COLLECTION
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
// ======================================================

export async function getAds(): Promise<
  BusinessAd[]
> {
  const snapshot =
    await getDocs(
      collection(
        db,
        COLLECTION
      )
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
// ======================================================

export async function getAd(
  id: string
): Promise<BusinessAd | null> {
  const snapshot =
    await getDoc(
      doc(
        db,
        COLLECTION,
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
  id: string,
  data: Partial<AdsData>
): Promise<void> {
  await updateDoc(
    doc(
      db,
      COLLECTION,
      id
    ),
    {
      ...data,

      updatedAt:
        serverTimestamp(),
    }
  );
}

// ======================================================
// DELETE AD
// ======================================================

export async function deleteAd(
  id: string
): Promise<void> {
  await deleteDoc(
    doc(
      db,
      COLLECTION,
      id
    )
  );
}

