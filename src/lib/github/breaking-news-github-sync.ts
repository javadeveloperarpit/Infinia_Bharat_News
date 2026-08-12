import {
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  serializeValue,
  writeGitHubJson,
} from "./github-utils";

const BREAKING_NEWS_PATH =
  "public/data/breakingNews.json";

async function getAllFirebaseBreakingNews() {
  const snapshot =
    await adminDb
      .collection("breakingNews")
      .get();

  return snapshot.docs.map(
    (doc) =>
      serializeValue({
        id: doc.id,
        ...doc.data(),
      })
  );
}

export async function syncBreakingNewsFromFirebase() {
  console.log(
    "=========================================="
  );

  console.log(
    "BREAKING NEWS SYNC START"
  );

  console.log(
    "=========================================="
  );

  const news =
    await getAllFirebaseBreakingNews();

  console.log(
    "Firebase breaking news:",
    news.length
  );

  await writeGitHubJson(
    BREAKING_NEWS_PATH,
    news,
    "Sync breakingNews.json from Firebase"
  );

  console.log(
    "BREAKING NEWS SYNC SUCCESS:",
    news.length
  );

  return {
    success: true,
    count: news.length,
  };
}

export async function syncBreakingNewsCreate(
  _news?: Record<string, any>
) {
  return syncBreakingNewsFromFirebase();
}

export async function syncBreakingNewsUpdate(
  _news?: Record<string, any>
) {
  return syncBreakingNewsFromFirebase();
}

export async function syncBreakingNewsDelete(
  _id?: string
) {
  return syncBreakingNewsFromFirebase();
}