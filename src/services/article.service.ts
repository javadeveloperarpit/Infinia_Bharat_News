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
// GET LATEST 5 CHANGED ARTICLES
//
// Reads ONLY:
// - latest 5 by updatedAt
// - latest 5 by createdAt
//
// Then merges them and returns only the latest 5.
//
// IMPORTANT:
// This does NOT read the complete articles collection.
// ======================================================

function timestampToMillis(
  value: any
): number {
  if (!value) return 0;

  if (
    typeof value === "object" &&
    typeof value?.toMillis === "function"
  ) {
    return value.toMillis();
  }

  if (
    typeof value === "object" &&
    typeof value?.toDate === "function"
  ) {
    return value.toDate().getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  const parsed =
    new Date(value).getTime();

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function latestArticleTime(
  article: any
): number {
  return Math.max(
    timestampToMillis(
      article?.createdAt
    ),
    timestampToMillis(
      article?.updatedAt
    )
  );
}

// ======================================================
// GET LATEST CHANGED ARTICLES
//
// Reads ONLY latest 5 Firebase articles.
//
// "Latest" means:
// max(createdAt, updatedAt)
//
// So:
// - newly created article
// - recently edited article
// - featured changed
// - priority changed
// - status changed
// etc.
// all get picked up.
//
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

  // We cannot directly order by max(createdAt, updatedAt)
  // in Firestore, so we fetch the latest by updatedAt
  // and separately latest by createdAt.
  //
  // Then merge them client-side and keep only latest 5.

  const updatedQuery = query(
    articlesRef,
    orderBy("updatedAt", "desc"),
    limit(safeCount)
  );

  const createdQuery = query(
    articlesRef,
    orderBy("createdAt", "desc"),
    limit(safeCount)
  );

  const [
    updatedSnapshot,
    createdSnapshot,
  ] = await Promise.all([
    getDocs(updatedQuery),
    getDocs(createdQuery),
  ]);

  const map = new Map<
    string,
    ArticleData & { id: string }
  >();

  updatedSnapshot.docs.forEach(
    (item) => {
      map.set(item.id, {
        id: item.id,
        ...item.data(),
      } as ArticleData & {
        id: string;
      });
    }
  );

  createdSnapshot.docs.forEach(
    (item) => {
      map.set(item.id, {
        id: item.id,
        ...item.data(),
      } as ArticleData & {
        id: string;
      });
    }
  );

  const getTime = (
    value: any
  ): number => {
    if (!value) return 0;

    if (
      typeof value?.toDate ===
      "function"
    ) {
      return value
        .toDate()
        .getTime();
    }

    const time =
      new Date(value).getTime();

    return Number.isFinite(time)
      ? time
      : 0;
  };

  return Array.from(map.values())
    .sort((a, b) => {
      const aCreated =
        getTime(
          (a as any).createdAt
        );

      const aUpdated =
        getTime(
          (a as any).updatedAt
        );

      const bCreated =
        getTime(
          (b as any).createdAt
        );

      const bUpdated =
        getTime(
          (b as any).updatedAt
        );

      const aLatest =
        Math.max(
          aCreated,
          aUpdated
        );

      const bLatest =
        Math.max(
          bCreated,
          bUpdated
        );

      return (
        bLatest - aLatest
      );
    })
    .slice(0, safeCount);
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
// BATCH FEATURED / PRIORITY UPDATE
// ======================================================

export async function updateFeaturedArticlesBatch(
  updates: Array<{
    id: string;
    featured: boolean;
    priority?: number | null;
  }>
) {
  if (!updates.length) {
    throw new Error(
      "No featured updates supplied"
    );
  }

  const token =
    await getAuthToken();

  const response =
    await fetch(
      "/api/admin/articles/featured-batch",
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            updates,
          }),
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      "Featured settings update failed"
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