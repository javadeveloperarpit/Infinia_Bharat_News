// ======================================================
// ARTICLE SYNC
// Firebase -> GitHub
// ======================================================

import {
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  serializeValue,
  writeGitHubJson,
} from "./github-utils";

// ======================================================
// PATH
// ======================================================

const ARTICLES_PATH =
  "public/data/articles.json";

// ======================================================
// GET ALL ARTICLES
// ======================================================

async function getAllFirebaseArticles() {

  const snapshot =
    await adminDb
      .collection("articles")
      .get();

  return snapshot.docs.map(
    (doc) =>
      serializeValue({
        id: doc.id,
        ...doc.data(),
      })
  );
}

// ======================================================
// MAIN ARTICLE SYNC
// ======================================================

export async function syncArticlesFromFirebase() {

  console.log(
    "=========================================="
  );

  console.log(
    "ARTICLE SYNC START"
  );

  console.log(
    "=========================================="
  );

  const articles =
    await getAllFirebaseArticles();

  console.log(
    "Firebase articles:",
    articles.length
  );

  await writeGitHubJson(
    ARTICLES_PATH,
    articles,
    "Sync articles.json from Firebase"
  );

  console.log(
    "ARTICLE SYNC SUCCESS:",
    articles.length
  );

  return {
    success: true,
    count: articles.length,
  };
}

// ======================================================
// ALIASES
// ======================================================

export async function syncArticleCreate(
  _article?: Record<string, any>
) {
  return syncArticlesFromFirebase();
}

export async function syncArticleUpdate(
  _article?: Record<string, any>
) {
  return syncArticlesFromFirebase();
}

export async function syncArticleDelete(
  _articleId?: string
) {
  return syncArticlesFromFirebase();
}