// ======================================================
// SHORTS SYNC
// Firebase -> GitHub
// ======================================================

import {
  commentsAdminDb,
} from "@/lib/firebase/firebase-comments-admin";

import {
  serializeValue,
  writeGitHubJson,
} from "./github-utils";

// ======================================================
// PATH
// ======================================================

const SHORTS_PATH =
  "public/data/shorts.json";

// ======================================================
// TYPES
// ======================================================

interface ShortItem {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
  publishedAt?: string;
}

// ======================================================
// GET SHORTS FROM FIREBASE
// ======================================================

async function getFirebaseShorts(): Promise<
  ShortItem[]
> {
  const snapshot =
    await commentsAdminDb
      .collection("shorts")
      .doc("config")
      .get();

  if (!snapshot.exists) {
    return [];
  }

  const data =
    snapshot.data() || {};

  const shorts =
    Array.isArray(data.shorts)
      ? data.shorts
      : Array.isArray(data.videos)
        ? data.videos
        : [];

  // ====================================================
  // CLEAN + SERIALIZE
  // ====================================================

  const cleaned =
    shorts
      .filter(
        (item: any) =>
          item &&
          typeof item.id === "string" &&
          item.id.trim()
      )
      .map(
        (item: any) => ({
          id: item.id.trim(),

          url:
            typeof item.url === "string" &&
            item.url.trim()
              ? item.url.trim()
              : `https://www.youtube.com/shorts/${item.id.trim()}`,

          title:
            typeof item.title === "string"
              ? item.title.trim()
              : "",

          thumbnail:
            typeof item.thumbnail === "string"
              ? item.thumbnail.trim()
              : `https://i.ytimg.com/vi/${item.id.trim()}/hqdefault.jpg`,

          ...(typeof item.publishedAt === "string" &&
          item.publishedAt.trim()
            ? {
                publishedAt:
                  item.publishedAt.trim(),
              }
            : {}),
        })
      );

  // ====================================================
  // LATEST -> OLDEST
  // ====================================================

  cleaned.sort(
    (a, b) => {
      const dateA =
        a.publishedAt
          ? new Date(
              a.publishedAt
            ).getTime()
          : 0;

      const dateB =
        b.publishedAt
          ? new Date(
              b.publishedAt
            ).getTime()
          : 0;

      return dateB - dateA;
    }
  );

  return serializeValue(
    cleaned
  ) as ShortItem[];
}

// ======================================================
// MAIN SYNC
// ======================================================

export async function syncShortsFromFirebase() {
  console.log(
    "=========================================="
  );

  console.log(
    "SHORTS SYNC START"
  );

  console.log(
    "=========================================="
  );

  const shorts =
    await getFirebaseShorts();

  console.log(
    "Firebase shorts:",
    shorts.length
  );

  await writeGitHubJson(
    SHORTS_PATH,
    shorts,
    "Sync shorts.json from Firebase"
  );

  console.log(
    "SHORTS SYNC SUCCESS:",
    shorts.length
  );

  return {
    success: true,
    count: shorts.length,
  };
}

// ======================================================
// ALIASES
// ======================================================

export async function syncShortsCreate() {
  return syncShortsFromFirebase();
}

export async function syncShortsUpdate() {
  return syncShortsFromFirebase();
}

export async function syncShortsDelete() {
  return syncShortsFromFirebase();
}