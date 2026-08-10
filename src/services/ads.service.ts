"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

import type {
  AdsData,
  CreateAdData,
  UpdateAdData,
  AdsCubeFaces,
  AdCubeFace,
} from "@/components/admin/ads/types";

// ======================================================
// COLLECTION
// ======================================================

const ADS_COLLECTION = "businessAds";

// ======================================================
// HELPERS
// ======================================================

function normalizeCubeFaces(
  value: unknown
): AdsCubeFaces | undefined {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return undefined;
  }

  const data =
    value as Record<string, unknown>;

  const normalizeFace = (
    face: string
  ) => {
    const faceData =
      data[face];

    if (
      !faceData ||
      typeof faceData !== "object"
    ) {
      return {
        imageUrl: "",
        targetUrl: "",
      };
    }

    const faceObject =
      faceData as Record<
        string,
        unknown
      >;

    return {
      imageUrl:
        typeof faceObject.imageUrl ===
        "string"
          ? faceObject.imageUrl
          : "",

      targetUrl:
        typeof faceObject.targetUrl ===
        "string"
          ? faceObject.targetUrl
          : "",
    };
  };

  return {
    front: normalizeFace("front"),
    back: normalizeFace("back"),
    left: normalizeFace("left"),
    right: normalizeFace("right"),
    top: normalizeFace("top"),
    bottom: normalizeFace("bottom"),
  };
}

function normalizeAd(
  id: string,
  data: Record<string, unknown>
): AdsData {
  return {
    id,

    name:
      typeof data.name === "string"
        ? data.name
        : "",

    type:
      (data.type ?? "image") as
        AdsData["type"],

    position:
      (data.position ?? "top") as
        AdsData["position"],

    active:
      Boolean(data.active ?? false),

    priority:
      Number(data.priority ?? 0),

    targetUrl:
      typeof data.targetUrl === "string"
        ? data.targetUrl
        : "",

    imageUrl:
      typeof data.imageUrl === "string"
        ? data.imageUrl
        : "",

    mobileImageUrl:
      typeof data.mobileImageUrl ===
      "string"
        ? data.mobileImageUrl
        : "",

    videoType:
      typeof data.videoType === "string"
        ? (data.videoType as AdsData["videoType"])
        : undefined,

    videoUrl:
      typeof data.videoUrl === "string"
        ? data.videoUrl
        : "",

    htmlCode:
      typeof data.htmlCode === "string"
        ? data.htmlCode
        : "",

    text:
      typeof data.text === "string"
        ? data.text
        : "",

    cubeFace:
      typeof data.cubeFace === "string"
        ? (data.cubeFace as AdCubeFace)
        : undefined,

    cubeFaces:
      normalizeCubeFaces(
        data.cubeFaces
      ),

    frequency:
      (data.frequency ?? "always") as
        AdsData["frequency"],

    startDate:
      typeof data.startDate === "string"
        ? data.startDate
        : null,

    endDate:
      typeof data.endDate === "string"
        ? data.endDate
        : null,

    openInNewTab:
      Boolean(
        data.openInNewTab ?? true
      ),

    impressions:
      Number(data.impressions ?? 0),

    clicks:
      Number(data.clicks ?? 0),

    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : undefined,

    updatedAt:
      typeof data.updatedAt === "string"
        ? data.updatedAt
        : undefined,
  };
}

// ======================================================
// GET ADS
// ======================================================

export async function getAds(): Promise<
  AdsData[]
> {
  const adsRef = collection(
    db,
    ADS_COLLECTION
  );

  const adsQuery = query(
    adsRef,
    orderBy("priority", "desc")
  );

  const snapshot =
    await getDocs(adsQuery);

  return snapshot.docs.map(
    (item) =>
      normalizeAd(
        item.id,
        item.data() as Record<
          string,
          unknown
        >
      )
  );
}

// ======================================================
// CREATE AD
// ======================================================

export async function createAd(
  data: CreateAdData
): Promise<string> {
  const adsRef = collection(
    db,
    ADS_COLLECTION
  );

  const docRef = await addDoc(
    adsRef,
    {
      ...data,

      active:
        data.active ?? true,

      priority:
        data.priority ?? 0,

      frequency:
        data.frequency ?? "always",

      impressions: 0,

      clicks: 0,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    }
  );

  return docRef.id;
}

// ======================================================
// UPDATE AD
// ======================================================

export async function updateAd(
  id: string,
  data: UpdateAdData
): Promise<void> {
  if (!id) {
    throw new Error(
      "Ad ID is required."
    );
  }

  const adRef = doc(
    db,
    ADS_COLLECTION,
    id
  );

  await updateDoc(adRef, {
    ...data,

    updatedAt:
      serverTimestamp(),
  });
}

// ======================================================
// DELETE AD
// ======================================================

export async function deleteAd(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "Ad ID is required."
    );
  }

  const adRef = doc(
    db,
    ADS_COLLECTION,
    id
  );

  await deleteDoc(adRef);
}

// ======================================================
// TOGGLE ACTIVE STATUS
// ======================================================

export async function toggleAdStatus(
  id: string,
  active: boolean
): Promise<void> {
  if (!id) {
    throw new Error(
      "Ad ID is required."
    );
  }

  const adRef = doc(
    db,
    ADS_COLLECTION,
    id
  );

  await updateDoc(adRef, {
    active,

    updatedAt:
      serverTimestamp(),
  });
}

// ======================================================
// UPDATE AD ANALYTICS
// ======================================================

export async function updateAdAnalytics(
  id: string,
  type:
    | "impression"
    | "click"
): Promise<void> {
  if (!id) {
    return;
  }

  const adRef = doc(
    db,
    ADS_COLLECTION,
    id
  );

  const field =
    type === "impression"
      ? "impressions"
      : "clicks";

  await updateDoc(adRef, {
    [field]: 1,

    updatedAt:
      serverTimestamp(),
  });
}