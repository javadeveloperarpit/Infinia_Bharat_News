import {
  getDoc,
  doc,
} from "firebase/firestore";

import {
  commentsDb,
} from "@/lib/firebase/firebase-comments";

// ==========================================
// SHORT ITEM
// ==========================================

export interface ShortItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt?: string;
}

// ==========================================
// GET SHORTS
// ==========================================

export async function getShorts(): Promise<
  ShortItem[]
> {
  const ref =
    doc(
      commentsDb,
      "shorts",
      "config"
    );

  const snapshot =
    await getDoc(ref);

  if (!snapshot.exists()) {
    return [];
  }

  const data =
    snapshot.data();

  if (
    Array.isArray(data.shorts)
  ) {
    return data.shorts as ShortItem[];
  }

  if (
    Array.isArray(data.videos)
  ) {
    return data.videos as ShortItem[];
  }

  return [];
}