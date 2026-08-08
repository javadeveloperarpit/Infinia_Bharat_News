import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

export interface PublicArticle {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  shortDescription: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  categoryId: string;
  category?: string;
  categoryHi?: string;
  featured: boolean;
  breaking: boolean;
  priority: number;
  status: "draft" | "published";

  author?: {
    uid?: string;
    name?: string;
    email?: string;
    role?: string;
    photo?: string;
    slug?: string;
    bio?: string;
  };

  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// FORMAT TIMESTAMP
// ==========================================

function formatTimestamp(value: any) {
  if (!value) {
    return undefined;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value?.seconds) {
    return new Date(
      value.seconds * 1000
    ).toISOString();
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

// ==========================================
// GET LATEST AUTHOR PROFILE
// ==========================================
//
// Article me author.uid saved hai.
// Us UID se users/{uid} ka latest profile
// fetch kiya jaata hai.
//
// Isse admin agar photo/bio/slug change kare,
// to old articles me bhi latest information
// automatically show hogi.
//
// ==========================================

async function getLatestAuthorProfile(
  articleAuthor: any
) {
  if (!articleAuthor?.uid) {
    return {
      uid: "",
      name:
        articleAuthor?.name ||
        "INFINIA BHARAT NEWS",
      email:
        articleAuthor?.email ||
        "news@infiniabharatnews.com",
      role:
        articleAuthor?.role ||
        "admin",
      photo:
        articleAuthor?.photo ||
        "",
      slug:
        articleAuthor?.slug ||
        "",
      bio:
        articleAuthor?.bio ||
        "",
    };
  }

  try {
    const userRef = doc(
      db,
      "users",
      articleAuthor.uid
    );

    const userSnap =
      await getDoc(userRef);

    // ======================================
    // USER PROFILE EXISTS
    // ======================================

    if (userSnap.exists()) {
      const user = userSnap.data();

      return {
        uid:
          user.uid ||
          articleAuthor.uid,

        name:
          user.name ||
          articleAuthor.name ||
          "INFINIA BHARAT NEWS",

        email:
          user.email ||
          articleAuthor.email ||
          "",

        role:
          user.role ||
          articleAuthor.role ||
          "editor",

        photo:
          user.photo ||
          articleAuthor.photo ||
          "",

        slug:
          user.slug ||
          articleAuthor.slug ||
          "",

        bio:
          user.bio ||
          articleAuthor.bio ||
          "",
      };
    }

    // ======================================
    // FALLBACK TO ARTICLE AUTHOR
    // ======================================

    return {
      uid:
        articleAuthor.uid || "",

      name:
        articleAuthor.name ||
        "INFINIA BHARAT NEWS",

      email:
        articleAuthor.email || "",

      role:
        articleAuthor.role ||
        "editor",

      photo:
        articleAuthor.photo || "",

      slug:
        articleAuthor.slug || "",

      bio:
        articleAuthor.bio || "",
    };

  } catch (error) {
    console.error(
      "GET AUTHOR PROFILE ERROR:",
      error
    );

    // ====================================
    // NEVER BREAK ARTICLE PAGE
    // ====================================

    return {
      uid:
        articleAuthor.uid || "",

      name:
        articleAuthor.name ||
        "INFINIA BHARAT NEWS",

      email:
        articleAuthor.email || "",

      role:
        articleAuthor.role ||
        "editor",

      photo:
        articleAuthor.photo || "",

      slug:
        articleAuthor.slug || "",

      bio:
        articleAuthor.bio || "",
    };
  }
}

// ==========================================
// FORMAT ARTICLE
// ==========================================

async function formatArticle(
  docSnapshot: any,
  category?: any
): Promise<PublicArticle> {
  const data =
    docSnapshot.data();

  const author =
    await getLatestAuthorProfile(
      data.author
    );

  return {
    id: docSnapshot.id,

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
      category?.name ||
      data.category ||
      "",

    categoryHi:
      category?.nameHi ||
      data.categoryHi ||
      "",

    featured:
      data.featured || false,

    breaking:
      data.breaking || false,

    priority:
      data.priority || 0,

    status:
      data.status || "published",

    author,

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
// CATEGORY ARTICLES
// ==========================================

export async function getPublishedArticlesByCategory(
  categoryId: string
): Promise<PublicArticle[]> {
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
    ),

    limit(18)
  );

  const snap =
    await getDocs(q);

  // ======================================
  // CATEGORY DOCUMENT
  // ======================================

  const categorySnap =
    await getDocs(
      query(
        collection(
          db,
          "categories"
        ),
        where(
          "name",
          "==",
          categoryId
        )
      )
    );

  const category =
    categorySnap.empty
      ? null
      : categorySnap.docs[0].data();

  // ======================================
  // FORMAT ARTICLES
  // ======================================

  return Promise.all(
    snap.docs.map((articleDoc) =>
      formatArticle(
        articleDoc,
        category
      )
    )
  );
}

// ==========================================
// LATEST ARTICLES
// ==========================================

export async function getPublishedArticles(): Promise<
  PublicArticle[]
> {
  const q = query(
    collection(db, "articles"),

    where(
      "status",
      "==",
      "published"
    ),

    orderBy(
      "priority",
      "desc"
    ),

    orderBy(
      "createdAt",
      "desc"
    ),

    limit(20)
  );

  const snap =
    await getDocs(q);

  return Promise.all(
    snap.docs.map((docSnapshot) =>
      formatArticle(
        docSnapshot
      )
    )
  );
}

// ==========================================
// FEATURED ARTICLES
// ==========================================

export async function getFeaturedArticles(): Promise<
  PublicArticle[]
> {
  const q = query(
    collection(db, "articles"),

    where(
      "featured",
      "==",
      true
    ),

    where(
      "status",
      "==",
      "published"
    ),

    orderBy(
      "priority",
      "desc"
    ),

    orderBy(
      "createdAt",
      "desc"
    ),

    limit(5)
  );

  const snap =
    await getDocs(q);

  return Promise.all(
    snap.docs.map((docSnapshot) =>
      formatArticle(
        docSnapshot
      )
    )
  );
}

// ==========================================
// SINGLE ARTICLE
// ==========================================

export async function getArticleBySlug(
  slug: string
): Promise<PublicArticle | null> {
  if (!slug) {
    return null;
  }

  const q = query(
    collection(db, "articles"),

    where(
      "slug",
      "==",
      slug
    )
  );

  const snapshot =
    await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return formatArticle(
    snapshot.docs[0]
  );
}

// ==========================================
// RELATED ARTICLES
// ==========================================

export async function getRelatedArticles(
  categoryId: string,
  currentSlug: string
): Promise<PublicArticle[]> {
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
      "priority",
      "desc"
    ),

    orderBy(
      "createdAt",
      "desc"
    ),

    limit(6)
  );

  const snap =
    await getDocs(q);

  const articles =
    await Promise.all(
      snap.docs.map(
        (docSnapshot) =>
          formatArticle(
            docSnapshot
          )
      )
    );

  return articles
    .filter(
      (item) =>
        item.slug !== currentSlug
    )
    .slice(0, 5);
}

