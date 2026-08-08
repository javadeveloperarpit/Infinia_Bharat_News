import "server-only";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";
import { adminDb } from "@/lib/firebase/firebase-admin";

import type {
  PublicArticle,
} from "./article.public.service";

// ==========================================
// PUBLIC AUTHOR
// ==========================================

export interface PublicAuthor {
  uid: string;
  name: string;
  email?: string;
  role?: string;
  photo?: string;
  slug: string;
  status?: string;
  bio?: string;
}

// ==========================================
// FORMAT TIMESTAMP
// ==========================================

function formatTimestamp(
  value: any
): string | undefined {

  if (!value) {
    return undefined;
  }

  // Firebase Admin Timestamp
  if (
    typeof value?.toDate === "function"
  ) {
    return value
      .toDate()
      .toISOString();
  }

  // Firebase Timestamp-like object
  if (
    typeof value?.seconds === "number"
  ) {
    return new Date(
      value.seconds * 1000
    ).toISOString();
  }

  // Normal date/string
  const date =
    new Date(value);

  if (
    isNaN(
      date.getTime()
    )
  ) {
    return undefined;
  }

  return date.toISOString();
}

// ==========================================
// FORMAT ARTICLE
// ==========================================

function formatArticle(
  doc: any
): PublicArticle {

  const data =
    doc.data();

  return {
    id: doc.id,

    title:
      data.title || "",

    slug:
      data.slug || "",

    thumbnail:
      data.thumbnail || "",

    shortDescription:
      data.shortDescription || "",

    content:
      data.content || "",

    seoTitle:
      data.seoTitle || "",

    seoDescription:
      data.seoDescription || "",

    categoryId:
      data.categoryId || "",

    category:
      data.category || "",

    categoryHi:
      data.categoryHi || "",

    featured:
      data.featured || false,

    breaking:
      data.breaking || false,

    priority:
      data.priority || 0,

    status:
      data.status || "published",

    author:
      data.author || {
        name: "INFINIA BHARAT NEWS",
        role: "admin",
      },

    createdAt:
      formatTimestamp(
        data.createdAt
      ),

    updatedAt:
      formatTimestamp(
        data.updatedAt
      ),
  };
}

// ==========================================
// GET AUTHOR BY SLUG
// ==========================================
//
// SERVER SIDE ONLY
//
// Firestore:
// users/{uid}
//
// Example:
//
// {
//   uid: "...",
//   name: "Arpit Mishra",
//   email: "arpit@example.com",
//   role: "editor",
//   status: "active",
//   photo: "...",
//   bio: "Professional bio",
//   slug: "arpit-mishra"
// }
//
// Public page:
//
// /author/arpit-mishra
//
// ==========================================

export async function getAuthorBySlug(
  slug: string
): Promise<PublicAuthor | null> {

  if (!slug) {
    return null;
  }

  try {

    const cleanSlug =
      slug
        .trim()
        .toLowerCase();

    // ======================================
    // FIND AUTHOR
    // ======================================

    const snapshot =
      await adminDb
        .collection("users")
        .where(
          "slug",
          "==",
          cleanSlug
        )
        .limit(1)
        .get();

    // ======================================
    // AUTHOR NOT FOUND
    // ======================================

    if (
      snapshot.empty
    ) {
      return null;
    }

    // ======================================
    // GET DOCUMENT
    // ======================================

    const doc =
      snapshot.docs[0];

    const data =
      doc.data();

    // ======================================
    // RETURN AUTHOR
    // ======================================

    return {

      uid:
        data.uid ||
        doc.id,

      name:
        data.name ||
        "INFINIA BHARAT NEWS",

      // IMPORTANT:
      // Email was missing here earlier.
      email:
        data.email ||
        "",

      role:
        data.role ||
        "editor",

      photo:
        data.photo ||
        "",

      slug:
        data.slug ||
        cleanSlug,

      status:
        data.status ||
        "active",

      bio:
        data.bio ||
        "",
    };

  } catch (error) {

    console.error(
      "GET AUTHOR BY SLUG ERROR:",
      error
    );

    return null;
  }
}

// ==========================================
// GET AUTHOR ARTICLES
// ==========================================
//
// IMPORTANT:
//
// We query ONLY:
//
// author.uid == authorUid
//
// We DO NOT add:
//
// where("status", "==", "published")
//
// because that may require a composite index.
//
// Instead:
//
// 1. Get author's articles
// 2. Convert them
// 3. Filter published articles in JS
// 4. Sort newest first
//
// ==========================================

export async function getAuthorArticles(
  authorUid: string
): Promise<PublicArticle[]> {

  if (!authorUid) {
    return [];
  }

  try {

    // ======================================
    // QUERY ARTICLES BY AUTHOR UID
    // ======================================

    const articlesQuery =
      query(
        collection(
          db,
          "articles"
        ),

        where(
          "author.uid",
          "==",
          authorUid
        )
      );

    const snapshot =
      await getDocs(
        articlesQuery
      );

    // ======================================
    // FORMAT + FILTER
    // ======================================

    const articles =
      snapshot.docs
        .map(
          (doc) =>
            formatArticle(doc)
        )
        .filter(
          (article) =>
            article.status ===
            "published"
        );

    // ======================================
    // LATEST FIRST
    // ======================================

    articles.sort(
      (a, b) => {

        const dateA =
          a.createdAt
            ? new Date(
                a.createdAt
              ).getTime()
            : 0;

        const dateB =
          b.createdAt
            ? new Date(
                b.createdAt
              ).getTime()
            : 0;

        return (
          dateB -
          dateA
        );
      }
    );

    return articles;

  } catch (error) {

    console.error(
      "GET AUTHOR ARTICLES ERROR:",
      error
    );

    return [];
  }
}

