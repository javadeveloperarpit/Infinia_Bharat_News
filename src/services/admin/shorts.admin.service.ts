"use client";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

// ==========================================
// ADMIN SHORTS TYPES
// ==========================================

export interface AdminShort {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
  publishedAt?: string;
}

export interface ShortsConfig {
  videos: AdminShort[];
  updatedAt?: string;
}

// ==========================================
// GET COMMENTS FIREBASE AUTH TOKEN
// ==========================================

async function getAdminToken() {
  const user =
    commentsAuth.currentUser;

  if (!user) {
    throw new Error(
      "Admin login required."
    );
  }

  return await user.getIdToken();
}

// ==========================================
// GET SHORTS CONFIG
// ==========================================

export async function getShortsConfig(): Promise<ShortsConfig> {
  const token =
    await getAdminToken();

  const response =
    await fetch(
      "/api/admin/shorts",
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        cache: "no-store",
      }
    );

  const result =
    await response.json();

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
        "Shorts config load nahi ho paaya."
    );
  }

  return {
    videos:
      Array.isArray(result.videos)
        ? result.videos
        : [],

    updatedAt:
      typeof result.updatedAt ===
      "string"
        ? result.updatedAt
        : undefined,
  };
}

// ==========================================
// UPDATE SHORTS CONFIG
// ==========================================

export async function updateShortsConfig(
  videos: AdminShort[]
) {
  const token =
    await getAdminToken();

  const response =
    await fetch(
      "/api/admin/shorts",
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          shorts: videos,
        }),
      }
    );

  const result =
    await response.json();

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
        "Shorts save nahi ho paaye."
    );
  }

  return {
    success: true,

    count:
      typeof result.count ===
      "number"
        ? result.count
        : videos.length,
  };
}