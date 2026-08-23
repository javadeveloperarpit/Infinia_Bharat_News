import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase/firebase";

// ======================================================
// ARTICLE DATA
// ======================================================

export interface ArticleData {
  title: string;

  categoryId: string;

  thumbnail: string;

  shortDescription: string;

  content: string;

  seoTitle: string;

  seoDescription: string;

  slug?: string;

  author?: {
    uid: string;
    name: string;
    email: string;
    role: string;
  };

  featured?: boolean;

  breaking?: boolean;

  priority?: number;

  status: "draft" | "published";
}

// ======================================================
// GET ALL ARTICLES
// ======================================================

export async function getArticles() {
  const snapshot = await getDocs(
    collection(db, "articles")
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as (ArticleData & {
    id: string;
  })[];
}
// ======================================================
// GET LATEST 5 ARTICLES
//
// IMPORTANT:
// This intentionally reads ONLY 5 Firebase documents.
// It is used by the admin dashboard to detect articles
// that have not yet reached articles.json.
// ======================================================

export async function getLatestArticles(
  count: number = 5
) {
  const safeCount = Math.max(
    1,
    Math.min(count, 5)
  );

  const articlesRef =
    collection(db, "articles");

  const latestQuery = query(
    articlesRef,
    orderBy("createdAt", "desc"),
    limit(safeCount)
  );

  const snapshot =
    await getDocs(latestQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as (ArticleData & {
    id: string;
  })[];
}

// ======================================================
// GET SINGLE ARTICLE
// ======================================================

export async function getArticleById(
  id: string
): Promise<
  (ArticleData & { id: string }) | null
> {
  const ref = doc(
    db,
    "articles",
    id
  );

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  } as ArticleData & {
    id: string;
  };
}

// ======================================================
// GET AUTH TOKEN
// ======================================================

async function getAuthToken() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Not logged in");
  }

  return user.getIdToken();
}

// ======================================================
// UPDATE ARTICLE
//
// Firebase update is handled by SERVER API.
// Server API:
// Firebase -> GitHub sync
// ======================================================

export async function updateArticle(
  id: string,
  data: Partial<ArticleData>
) {
  if (!id) {
    throw new Error("Article ID missing");
  }

  const token =
    await getAuthToken();

  const response =
    await fetch(
      `/api/admin/articles/${id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(data),
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      "Article update failed"
    );
  }

  return result;
}

// ======================================================
// DELETE ARTICLE
//
// IMPORTANT:
//
// DO NOT USE deleteDoc() HERE.
//
// Delete must go through the server API:
//
// Client
//   ↓
// DELETE /api/admin/articles/:id
//   ↓
// Firebase delete
//   ↓
// syncArticlesFromFirebase()
//   ↓
// GitHub articles.json
//
// ======================================================

export async function deleteArticle(
  id: string
) {
  if (!id) {
    throw new Error(
      "Article ID missing"
    );
  }

  const token =
    await getAuthToken();

  const response =
    await fetch(
      `/api/admin/articles/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      "Article delete failed"
    );
  }

  return result;
}