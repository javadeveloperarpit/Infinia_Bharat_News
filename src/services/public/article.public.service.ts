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

// ============================================================
// TYPES
// ============================================================

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

// ============================================================
// CREATE AUTHOR SLUG
// ============================================================

function createAuthorSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============================================================
// FORMAT TIMESTAMP
// ============================================================

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

// ============================================================
// VERIFIED AUTHOR PHOTO FALLBACK
// ============================================================
//
// Confirmed working Arpit Mishra profile image.
// This is used only when Firestore does not contain
// an author photo.
//
// ============================================================

const ARPIT_MISHRA_PHOTO =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhleYE3u57u2LIBNwS0wcdK8_2DdClNs9NHzArdEt5_4F-FDCAQD0KYKW2rRzIQustLfKOdwKkCwI4an3JpMepTyCS71v11b0ab12389xMefgfY9B7sniXiZOSe3rf4d4hzQH6h31lNUmehFqJOHq35VqRCaEaWNyZ0mIoc0CBmhumWmEP_3Vy9835f1s9k/s1600/ArpitMishra.jpeg";

// ============================================================
// GET AUTHOR PHOTO
// ============================================================

function getAuthorPhoto(
  user: any,
  articleAuthor: any,
  authorName: string
) {
  // ----------------------------------------------------------
  // Check all common profile-image fields
  // ----------------------------------------------------------

  const firestorePhoto =
    user?.photo ||
    user?.profilePhoto ||
    user?.photoURL ||
    user?.profileImage ||
    user?.image ||
    user?.imageUrl ||
    user?.avatar ||
    articleAuthor?.photo ||
    articleAuthor?.profilePhoto ||
    articleAuthor?.photoURL ||
    articleAuthor?.profileImage ||
    articleAuthor?.image ||
    articleAuthor?.imageUrl ||
    "";

  if (firestorePhoto) {
    return String(firestorePhoto);
  }

  // ----------------------------------------------------------
  // Confirmed Arpit Mishra fallback
  // ----------------------------------------------------------

  if (
    authorName
      .trim()
      .toLowerCase() === "arpit mishra"
  ) {
    return ARPIT_MISHRA_PHOTO;
  }

  return "";
}

// ============================================================
// GET LATEST AUTHOR PROFILE
// ============================================================
//
// Article me author.uid saved hai.
//
// users/{uid} se latest profile fetch hota hai.
//
// Agar users document me photo/slug available nahi hai,
// article author data fallback hota hai.
//
// ============================================================

async function getLatestAuthorProfile(
  articleAuthor: any
) {
  // ==========================================================
  // NO AUTHOR UID
  // ==========================================================

  if (!articleAuthor?.uid) {
    const name =
      articleAuthor?.name ||
      "INFINIA BHARAT NEWS";

    return {
      uid: "",
      name,
      email:
        articleAuthor?.email ||
        "news@infiniabharatnews.com",
      role:
        articleAuthor?.role ||
        "admin",
      photo:
        getAuthorPhoto(
          {},
          articleAuthor,
          name
        ),
      slug:
        articleAuthor?.slug ||
        createAuthorSlug(name),
      bio:
        articleAuthor?.bio ||
        "",
    };
  }

  try {
    // ========================================================
    // GET USER DOCUMENT
    // ========================================================

    const userRef = doc(
      db,
      "users",
      articleAuthor.uid
    );

    const userSnap =
      await getDoc(userRef);

    // ========================================================
    // USER PROFILE EXISTS
    // ========================================================

    if (userSnap.exists()) {
      const user =
        userSnap.data();

      const name =
        user.name ||
        articleAuthor.name ||
        "INFINIA BHARAT NEWS";

      const photo =
        getAuthorPhoto(
          user,
          articleAuthor,
          name
        );

      const slug =
        user.slug ||
        articleAuthor.slug ||
        createAuthorSlug(name);

      console.log(
        "FORMATTED AUTHOR:",
        {
          uid:
            user.uid ||
            articleAuthor.uid,

          name,

          photo,

          slug,
        }
      );

      return {
        uid:
          user.uid ||
          articleAuthor.uid,

        name,

        email:
          user.email ||
          articleAuthor.email ||
          "",

        role:
          user.role ||
          articleAuthor.role ||
          "editor",

        photo,

        slug,

        bio:
          user.bio ||
          articleAuthor.bio ||
          "",
      };
    }

    // ========================================================
    // USER DOCUMENT DOES NOT EXIST
    // ========================================================

    const name =
      articleAuthor.name ||
      "INFINIA BHARAT NEWS";

    const photo =
      getAuthorPhoto(
        {},
        articleAuthor,
        name
      );

    const slug =
      articleAuthor.slug ||
      createAuthorSlug(name);

    return {
      uid:
        articleAuthor.uid ||
        "",

      name,

      email:
        articleAuthor.email ||
        "",

      role:
        articleAuthor.role ||
        "editor",

      photo,

      slug,

      bio:
        articleAuthor.bio ||
        "",
    };
  } catch (error) {
    console.error(
      "GET AUTHOR PROFILE ERROR:",
      error
    );

    // ========================================================
    // NEVER BREAK ARTICLE PAGE
    // ========================================================

    const name =
      articleAuthor.name ||
      "INFINIA BHARAT NEWS";

    const photo =
      getAuthorPhoto(
        {},
        articleAuthor,
        name
      );

    const slug =
      articleAuthor.slug ||
      createAuthorSlug(name);

    return {
      uid:
        articleAuthor.uid ||
        "",

      name,

      email:
        articleAuthor.email ||
        "",

      role:
        articleAuthor.role ||
        "editor",

      photo,

      slug,

      bio:
        articleAuthor.bio ||
        "",
    };
  }
}

// ============================================================
// FORMAT ARTICLE
// ============================================================

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

// ============================================================
// CATEGORY ARTICLES
// ============================================================

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

  // ==========================================================
  // CATEGORY DOCUMENT
  // ==========================================================

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

  // ==========================================================
  // FORMAT ARTICLES
  // ==========================================================

  return Promise.all(
    snap.docs.map(
      (articleDoc) =>
        formatArticle(
          articleDoc,
          category
        )
    )
  );
}

// ============================================================
// LATEST ARTICLES
// ============================================================

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
    snap.docs.map(
      (docSnapshot) =>
        formatArticle(
          docSnapshot
        )
    )
  );
}

// ============================================================
// FEATURED ARTICLES
// ============================================================

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
    snap.docs.map(
      (docSnapshot) =>
        formatArticle(
          docSnapshot
        )
    )
  );
}

// ============================================================
// SINGLE ARTICLE
// ============================================================

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

// ============================================================
// RELATED ARTICLES
// ============================================================

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

