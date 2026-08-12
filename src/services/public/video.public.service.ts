// ============================================================
// PUBLIC VIDEO SERVICE
// ============================================================
//
// IMPORTANT:
//
// Public website Firebase se videos READ nahi karti.
//
// Source:
//     GitHub -> public/data/videos.json
//
// Firebase:
//     ONLY admin/master database
//
// Flow:
//
// Firebase
//    ↓
// Video Sync
//    ↓
// videos.json
//    ↓
// Public Website
//
// ============================================================

import fs from "fs/promises";
import path from "path";

// ============================================================
// TYPES
// ============================================================

export interface PublicVideo {
  id: string;

  title: string;

  youtubeUrl: string;

  thumbnail: string;

  description: string;

  categoryId: string;

  category?: string;

  categoryHi?: string;

  status: "draft" | "published";

  createdAt?: string;

  updatedAt?: string;

  views?: number;
}

// ============================================================
// VIDEO JSON PATH
// ============================================================

const VIDEOS_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "videos.json"
);

// ============================================================
// TIMESTAMP FORMAT
// ============================================================

function formatTimestamp(value: any): string | undefined {
  if (!value) {
    return undefined;
  }

  // Firestore Timestamp-like object
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  // Serialized Firestore Timestamp
  if (
    typeof value === "object" &&
    typeof value?.seconds === "number"
  ) {
    return new Date(
      value.seconds * 1000
    ).toISOString();
  }

  // Already a date/string
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

// ============================================================
// YOUTUBE VIDEO ID
// ============================================================

function getYoutubeVideoId(
  url: string
): string {
  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);

    // youtube.com/watch?v=
    const queryId =
      parsed.searchParams.get("v");

    if (queryId) {
      return queryId;
    }

    // youtu.be/VIDEO_ID
    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {
      return parsed.pathname
        .replace("/", "")
        .trim();
    }

    // youtube.com/shorts/VIDEO_ID
    const shortsMatch =
      parsed.pathname.match(
        /\/shorts\/([^/]+)/
      );

    if (shortsMatch?.[1]) {
      return shortsMatch[1];
    }

    // youtube.com/embed/VIDEO_ID
    const embedMatch =
      parsed.pathname.match(
        /\/embed\/([^/]+)/
      );

    if (embedMatch?.[1]) {
      return embedMatch[1];
    }

  } catch {
    return "";
  }

  return "";
}

// ============================================================
// YOUTUBE THUMBNAIL
// ============================================================

function getYoutubeThumbnail(
  url: string
): string {
  const videoId =
    getYoutubeVideoId(url);

  if (!videoId) {
    return "";
  }

  return (
    `https://img.youtube.com/vi/` +
    `${videoId}/maxresdefault.jpg`
  );
}

// ============================================================
// LOAD VIDEOS
// ============================================================
//
// IMPORTANT:
//
// This function runs on the SERVER.
//
// Therefore:
//
// ❌ fetch("/data/videos.json")
//
// is NOT used here.
//
// Instead:
//
// ✅ fs.readFile()
//    public/data/videos.json
//
// This fixes:
//
// "Failed to parse URL"
// "ENOENT videos.json"
// ============================================================

async function loadVideos(): Promise<any[]> {
  try {
    const file =
      await fs.readFile(
        VIDEOS_PATH,
        "utf-8"
      );

    const data =
      JSON.parse(file);

    if (!Array.isArray(data)) {
      console.error(
        "videos.json is not an array"
      );

      return [];
    }

    return data;

  } catch (error) {

    console.error(
      "LOAD VIDEOS JSON ERROR:",
      error
    );

    return [];
  }
}

// ============================================================
// FORMAT VIDEO
// ============================================================

function formatVideo(
  data: any
): PublicVideo {

  const youtubeUrl =
    data?.youtubeUrl ||
    data?.url ||
    "";

  return {
    id: String(
      data?.id || ""
    ),

    title:
      data?.title ||
      "",

    youtubeUrl,

    thumbnail:
      data?.thumbnail ||
      data?.image ||
      getYoutubeThumbnail(
        youtubeUrl
      ),

    description:
      data?.description ||
      data?.shortDescription ||
      "",

    categoryId:
      data?.categoryId ||
      "",

    category:
      data?.category ||
      "",

    categoryHi:
      data?.categoryHi ||
      "",

    status:
      data?.status ===
      "published"
        ? "published"
        : "draft",

    createdAt:
      formatTimestamp(
        data?.createdAt
      ),

    updatedAt:
      formatTimestamp(
        data?.updatedAt
      ),

    views:
      Number(
        data?.views || 0
      ),
  };
}

// ============================================================
// SORT VIDEOS
// ============================================================

function sortVideos(
  videos: PublicVideo[]
): PublicVideo[] {

  return [...videos].sort(
    (a, b) => {

      const dateA =
        new Date(
          a.createdAt || 0
        ).getTime();

      const dateB =
        new Date(
          b.createdAt || 0
        ).getTime();

      return dateB - dateA;
    }
  );
}

// ============================================================
// GET PUBLISHED VIDEOS
// ============================================================

export async function getPublishedVideos()
: Promise<PublicVideo[]> {

  const rawVideos =
    await loadVideos();

  const videos =
    rawVideos
      .filter(
        (video) =>
          video?.status ===
          "published"
      )
      .map(
        (video) =>
          formatVideo(video)
      );

  return sortVideos(
    videos
  ).slice(0, 20);
}

// ============================================================
// GET PUBLISHED VIDEOS BY CATEGORY
// ============================================================

export async function
getPublishedVideosByCategory(
  categoryId: string
): Promise<PublicVideo[]> {

  if (!categoryId) {
    return [];
  }

  const rawVideos =
    await loadVideos();

  const videos =
    rawVideos
      .filter(
        (video) =>
          video?.status ===
            "published" &&
          String(
            video?.categoryId || ""
          ) ===
            String(categoryId)
      )
      .map(
        (video) =>
          formatVideo(video)
      );

  return sortVideos(
    videos
  ).slice(0, 18);
}

// ============================================================
// GET SINGLE VIDEO
// ============================================================

export async function
getVideoById(
  id: string
): Promise<PublicVideo | null> {

  if (!id) {
    return null;
  }

  const rawVideos =
    await loadVideos();

  const video =
    rawVideos.find(
      (item) =>
        String(item?.id || "") ===
        String(id)
    );

  if (!video) {
    return null;
  }

  return formatVideo(video);
}

// ============================================================
// RELATED VIDEOS
// ============================================================

export async function
getRelatedVideos(
  categoryId: string,
  currentId: string
): Promise<PublicVideo[]> {

  if (!categoryId) {
    return [];
  }

  const rawVideos =
    await loadVideos();

  const videos =
    rawVideos
      .filter(
        (video) =>
          video?.status ===
            "published" &&
          String(
            video?.categoryId || ""
          ) ===
            String(categoryId) &&
          String(
            video?.id || ""
          ) !==
            String(currentId)
      )
      .map(
        (video) =>
          formatVideo(video)
      );

  return sortVideos(
    videos
  ).slice(0, 6);
}