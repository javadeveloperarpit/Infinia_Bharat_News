import fs from "fs/promises";
import path from "path";

import type {
  BusinessAd,
  AdType,
} from "@/services/ads.service";

// ======================================================
// PUBLIC ADS SERVICE
// ======================================================

const ADS_PATH =
  path.join(
    process.cwd(),
    "public",
    "data",
    "ads.json"
  );

// ======================================================
// LOAD ADS JSON
// ======================================================

async function loadAds(): Promise<BusinessAd[]> {
  try {
    const file =
      await fs.readFile(
        ADS_PATH,
        "utf-8"
      );

    // ----------------------------------------------
    // EMPTY FILE = NO ADS
    // ----------------------------------------------

    if (!file.trim()) {
      return [];
    }

    // ----------------------------------------------
    // SAFE JSON PARSE
    // ----------------------------------------------

    let data: unknown;

    try {
      data = JSON.parse(file);
    } catch {
      return [];
    }

    // ----------------------------------------------
    // DIRECT ARRAY
    // ----------------------------------------------

    if (Array.isArray(data)) {
      return data as BusinessAd[];
    }

    // ----------------------------------------------
    // { ads: [...] }
    // ----------------------------------------------

    if (
      data &&
      typeof data === "object" &&
      Array.isArray(
        (data as { ads?: unknown }).ads
      )
    ) {
      return (
        (data as {
          ads: BusinessAd[];
        }).ads
      );
    }

    // ----------------------------------------------
    // INVALID STRUCTURE
    // ----------------------------------------------

    return [];

  } catch {
    // ----------------------------------------------
    // FILE DOES NOT EXIST / READ ERROR
    // Treat as no ads
    // ----------------------------------------------

    return [];
  }
}

// ======================================================
// GET ALL ACTIVE ADS
// ======================================================

export async function getAds(): Promise<BusinessAd[]> {
  const ads =
    await loadAds();

  return ads.filter(
    (ad) =>
      ad &&
      ad.active === true
  );
}

// ======================================================
// GET ADS BY TYPE
// ======================================================

export async function getAdsByType(
  type: AdType
): Promise<BusinessAd[]> {
  const ads =
    await loadAds();

  return ads
    .filter(
      (ad) =>
        ad &&
        ad.active === true &&
        ad.type === type
    )
    .sort(
      (a, b) =>
        (b.priority ?? 1) -
        (a.priority ?? 1)
    );
}

// ======================================================
// GET SINGLE AD
// ======================================================

export async function getAd(
  type: AdType,
  id: string
): Promise<BusinessAd | null> {

  if (!type || !id) {
    return null;
  }

  const ads =
    await loadAds();

  const ad =
    ads.find(
      (item) =>
        item.type === type &&
        item.id === id &&
        item.active === true
    );

  return ad || null;
}