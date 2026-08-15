// ============================================================
// PUBLIC LIVE TV SERVICE
// ============================================================
//
// Public website Firebase se Live TV READ nahi karti.
//
// Source:
//     GitHub -> public/data/live-tv.json
//
// Firebase:
//     ONLY admin/master database
//
// Flow:
//
// Firebase
//    ↓
// Live TV Sync
//    ↓
// live-tv.json
//    ↓
// Public Website
//
// ============================================================

import fs from "fs/promises";
import path from "path";

// ============================================================
// TYPES
// ============================================================

export interface PublicLiveTvChannel {

  id: string;

  title: string;

  youtubeUrl: string;

  enabled: boolean;

  order: number;

  logo?: string;

  createdAt?: string;

  updatedAt?: string;

}

// ============================================================
// JSON PATH
// ============================================================

const LIVE_TV_PATH =
  path.join(
    process.cwd(),
    "public",
    "data",
    "live-tv.json"
  );

// ============================================================
// TIMESTAMP FORMAT
// ============================================================

function formatTimestamp(
  value: any
): string | undefined {

  if (!value) {
    return undefined;
  }

  // Firestore Timestamp-like

  if (
    typeof value?.toDate === "function"
  ) {

    return value
      .toDate()
      .toISOString();

  }

  // Serialized Firestore timestamp

  if (
    typeof value === "object" &&
    typeof value?.seconds === "number"
  ) {

    return new Date(
      value.seconds * 1000
    ).toISOString();

  }

  const date =
    new Date(value);

  if (
    isNaN(
      date.getTime()
    )
  ) {

    return undefined;

  }

  return date.toISOString();
}

// ============================================================
// LOAD LIVE TV JSON
// ============================================================

async function loadLiveTv(): Promise<any[]> {

  try {

    const file =
      await fs.readFile(
        LIVE_TV_PATH,
        "utf-8"
      );

    const data =
      JSON.parse(file);

    if (
      !Array.isArray(data)
    ) {

      console.error(
        "live-tv.json is not an array"
      );

      return [];

    }

    return data;

  } catch (error) {

    console.error(
      "LOAD LIVE TV JSON ERROR:",
      error
    );

    return [];

  }

}

// ============================================================
// FORMAT CHANNEL
// ============================================================

function formatLiveTv(
  data: any
): PublicLiveTvChannel {

  return {

    id:
      String(
        data?.id || ""
      ),

    title:
      data?.title ||
      "",

    youtubeUrl:
      data?.youtubeUrl ||
      "",

    enabled:
      data?.enabled === true,

    order:
      Number(
        data?.order ?? 0
      ),

    logo:
      data?.logo ||
      undefined,

    createdAt:
      formatTimestamp(
        data?.createdAt
      ),

    updatedAt:
      formatTimestamp(
        data?.updatedAt
      ),

  };

}

// ============================================================
// SORT CHANNELS
// ============================================================

function sortChannels(
  channels: PublicLiveTvChannel[]
): PublicLiveTvChannel[] {

  return [
    ...channels,
  ].sort(
    (a, b) =>
      Number(a.order ?? 0) -
      Number(b.order ?? 0)
  );

}

// ============================================================
// GET ALL ENABLED LIVE TV
// ============================================================

export async function
getPublicLiveTv()
: Promise<PublicLiveTvChannel[]> {

  const rawChannels =
    await loadLiveTv();

  const channels =
    rawChannels
      .filter(
        (channel) =>
          channel?.enabled === true
      )
      .map(
        (channel) =>
          formatLiveTv(channel)
      )
      .filter(
        (channel) =>
          Boolean(
            channel.youtubeUrl
          )
      );

  return sortChannels(
    channels
  );

}

// ============================================================
// GET SINGLE LIVE TV CHANNEL
// ============================================================

export async function
getPublicLiveTvById(
  id: string
): Promise<
  PublicLiveTvChannel | null
> {

  if (!id) {
    return null;
  }

  const rawChannels =
    await loadLiveTv();

  const channel =
    rawChannels.find(
      (item) =>
        String(
          item?.id || ""
        ) === String(id)
    );

  if (!channel) {
    return null;
  }

  if (
    channel?.enabled !== true
  ) {
    return null;
  }

  return formatLiveTv(
    channel
  );

}

// ============================================================
// GET ALL LIVE TV
// ============================================================
//
// Useful for public pages that need
// every enabled channel.
//

export async function
getAllPublicLiveTv()
: Promise<
  PublicLiveTvChannel[]
> {

  const rawChannels =
    await loadLiveTv();

  return sortChannels(
    rawChannels
      .map(
        (channel) =>
          formatLiveTv(channel)
      )
  );

}