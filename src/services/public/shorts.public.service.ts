import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  commentsDb,
} from "@/lib/firebase/firebase-comments";

// ==========================================
// SHORT ITEM
// ==========================================

export interface PublicShort {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt?: string;
}

// ==========================================
// GET PUBLIC SHORTS
// ==========================================

export async function getPublishedShorts(): Promise<
  PublicShort[]
> {
  try {
    const ref =
      doc(
        commentsDb,
        "shorts",
        "config"
      );

    const snapshot =
      await getDoc(ref);

    if (
      !snapshot.exists()
    ) {
      return [];
    }

    const data =
      snapshot.data();

    const shorts =
      Array.isArray(
        data.videos
      )
        ? data.videos
        : Array.isArray(
            data.shorts
          )
          ? data.shorts
          : [];

    return shorts
      .filter(
        (item: any) =>
          item &&
          typeof item.id ===
            "string"
      )
      .map(
        (item: any) => ({
          id:
            item.id.trim(),

          title:
            typeof item.title ===
            "string"
              ? item.title.trim()
              : "",

          url:
            typeof item.url ===
            "string" &&
            item.url.trim()
              ? item.url.trim()
              : `https://www.youtube.com/shorts/${item.id}`,

          thumbnail:
            typeof item.thumbnail ===
            "string" &&
            item.thumbnail.trim()
              ? item.thumbnail.trim()
              : `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,

          publishedAt:
            typeof item.publishedAt ===
            "string"
              ? item.publishedAt
              : undefined,
        })
      );
  } catch (error) {
    console.error(
      "GET PUBLIC SHORTS ERROR:",
      error
    );

    return [];
  }
}