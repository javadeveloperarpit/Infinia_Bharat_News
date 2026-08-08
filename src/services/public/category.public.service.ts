import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

function formatDate(value: any) {
  if (!value) return "";

  if (value.toDate) {
    return value.toDate().toISOString();
  }

  return value;
}

export async function getCategoryArticles(
  categoryId: string
) {
  const q = query(
    collection(db, "articles"),

    where(
      "status",
      "==",
      "published"
    ),

    where(
      "categoryId",
      "==",
      categoryId
    ),

    orderBy(
      "createdAt",
      "desc"
    )
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,

      // IMPORTANT: Article URL ke liye slug
      slug: data.slug || "",

      title: data.title || "",

      thumbnail:
        data.thumbnail || "",

      shortDescription:
        data.shortDescription || "",

      content:
        data.content || "",

      categoryId:
        data.categoryId || "",

      status:
        data.status || "",

      breaking:
        data.breaking || false,

      featured:
        data.featured || false,

      priority:
        data.priority || 0,

      seoTitle:
        data.seoTitle || "",

      seoDescription:
        data.seoDescription || "",

      createdAt:
        formatDate(data.createdAt),

      updatedAt:
        formatDate(data.updatedAt),
    };
  });
}

export async function getCategoryVideos(
  categoryId: string
) {
  const q = query(
    collection(db, "videos"),

    where(
      "status",
      "==",
      "published"
    ),

    where(
      "categoryId",
      "==",
      categoryId
    ),

    orderBy(
      "createdAt",
      "desc"
    )
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,

      title:
        data.title || "",

      thumbnail:
        data.thumbnail || "",

      youtubeUrl:
        data.youtubeUrl || "",

      description:
        data.description || "",

      categoryId:
        data.categoryId || "",

      status:
        data.status || "",

      createdAt:
        formatDate(data.createdAt),

      updatedAt:
        formatDate(data.updatedAt),
    };
  });
}

