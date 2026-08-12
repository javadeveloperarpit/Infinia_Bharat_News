import fs from "fs/promises";
import path from "path";


// ============================================================
// PUBLIC ARTICLE SERVICE
// ============================================================
//
// IMPORTANT:
//
// Public website Firebase se articles READ nahi karti.
//
// Source:
//     GitHub -> public/data/articles.json
//
// Firebase:
//     ONLY admin/master database
//
// Flow:
//
// Firebase
//    ↓
// GitHub Sync
//    ↓
// articles.json
//    ↓
// Public Website
//
// ============================================================


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
// CATEGORY TYPE
// ============================================================

interface ArticleCategory {
  id?: string;

  name?: string;

  nameHi?: string;

  slug?: string;
}


// ============================================================
// ARPIT MISHRA PHOTO FALLBACK
// ============================================================

const ARPIT_MISHRA_PHOTO =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhleYE3u57u2LIBNwS0wcdK8_2DdClNs9NHzArdEt5_4F-FDCAQD0KYKW2rRzIQustLfKOdwKkCwI4an3JpMepTyCS71v11b0ab12389xMefgfY9B7sniXiZOSe3rf4d4hzQH6h31lNUmehFqJOHq35VqRCaEaWNyZ0mIoc0CBmhumWmEP_3Vy9835f1s9k/s1600/ArpitMishra.jpeg";


// ============================================================
// CREATE AUTHOR SLUG
// ============================================================

function createAuthorSlug(
  name: string
) {
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

function formatTimestamp(
  value: any
) {

  if (!value) {
    return undefined;
  }


  if (
    typeof value?.toDate ===
    "function"
  ) {

    return value
      .toDate()
      .toISOString();

  }


  if (
    value?.seconds
  ) {

    return new Date(
      value.seconds * 1000
    ).toISOString();

  }


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


// ============================================================
// GET AUTHOR PHOTO
// ============================================================

function getAuthorPhoto(
  articleAuthor: any,
  authorName: string
) {

  const photo =
    articleAuthor?.photo ||
    articleAuthor?.profilePhoto ||
    articleAuthor?.photoURL ||
    articleAuthor?.profileImage ||
    articleAuthor?.image ||
    articleAuthor?.imageUrl ||
    articleAuthor?.avatar ||
    "";


  if (photo) {
    return String(photo);
  }


  if (
    authorName
      .trim()
      .toLowerCase() ===
    "arpit mishra"
  ) {

    return ARPIT_MISHRA_PHOTO;

  }


  return "";
}


// ============================================================
// FORMAT AUTHOR
// ============================================================
//
// NO FIREBASE REQUEST.
//
// Author information comes directly from
// articles.json.
//
// ============================================================

function formatAuthor(
  articleAuthor: any
) {

  const name =
    articleAuthor?.name ||
    "INFINIA BHARAT NEWS";


  return {

    uid:
      articleAuthor?.uid ||
      "",

    name,

    email:
      articleAuthor?.email ||
      "news@infiniabharatnews.com",

    role:
      articleAuthor?.role ||
      "editor",

    photo:
      getAuthorPhoto(
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


// ============================================================
// FORMAT RAW ARTICLE
// ============================================================

function formatArticle(
  data: any,
  category?: ArticleCategory
): PublicArticle {

  const articleAuthor =
    formatAuthor(
      data?.author
    );


  return {

    id:
      String(
        data?.id ||
        ""
      ),

    title:
      data?.title ||
      "",

    slug:
      data?.slug ||
      "",

    thumbnail:
      data?.thumbnail ||
      "",

    shortDescription:
      data?.shortDescription ||
      "",

    content:
      data?.content ||
      "",

    seoTitle:
      data?.seoTitle ||
      "",

    seoDescription:
      data?.seoDescription ||
      "",

    categoryId:
      data?.categoryId ||
      "",

    category:
      category?.name ||
      data?.category ||
      "",

    categoryHi:
      category?.nameHi ||
      data?.categoryHi ||
      "",

    featured:
      Boolean(
        data?.featured
      ),

    breaking:
      Boolean(
        data?.breaking
      ),

    priority:
      Number(
        data?.priority || 0
      ),

    status:
      data?.status ===
      "published"
        ? "published"
        : "draft",

    author:
      articleAuthor,

    createdAt:
      formatTimestamp(
        data?.createdAt
      ),

    updatedAt:
      formatTimestamp(
        data?.updatedAt
      ),

  };

}


// ============================================================
// LOAD ARTICLES JSON
// ============================================================
//
// SERVER SOURCE:
// public/data/articles.json
//
// Browser source is also:
// /data/articles.json
//
// Server Components ke andar relative fetch()
// use nahi karna hai.
// ============================================================

async function loadArticles(): Promise<any[]> {

  try {

    const filePath =
      path.join(
        process.cwd(),
        "public",
        "data",
        "articles.json"
      );

    const file =
      await fs.readFile(
        filePath,
        "utf-8"
      );

    const data =
      JSON.parse(file);

    if (!Array.isArray(data)) {

      console.error(
        "articles.json is not an array"
      );

      return [];
    }

    return data;

  } catch (error) {

    console.error(
      "LOAD ARTICLES JSON ERROR:",
      error
    );

    return [];
  }
}


// ============================================================
// SORT ARTICLES
// ============================================================

function sortArticles(
  articles: PublicArticle[]
) {

  return [
    ...articles,
  ].sort(
    (
      a,
      b
    ) => {

      const priorityA =
        Number(
          a.priority || 0
        );

      const priorityB =
        Number(
          b.priority || 0
        );


      if (
        priorityA !==
        priorityB
      ) {

        return (
          priorityB -
          priorityA
        );

      }


      const dateA =
        new Date(
          a.createdAt ||
          0
        ).getTime();


      const dateB =
        new Date(
          b.createdAt ||
          0
        ).getTime();


      return (
        dateB -
        dateA
      );

    }
  );

}


// ============================================================
// PUBLISHED ARTICLES
// ============================================================

export async function getPublishedArticles(): Promise<
  PublicArticle[]
> {

  const rawArticles =
    await loadArticles();


  const articles =
    rawArticles
      .filter(
        (
          article
        ) =>
          article?.status ===
          "published"
      )
      .map(
        (
          article
        ) =>
          formatArticle(
            article
          )
      );


  return sortArticles(
    articles
  ).slice(
    0,
    20
  );

}


// ============================================================
// FEATURED ARTICLES
// ============================================================

export async function getFeaturedArticles(): Promise<
  PublicArticle[]
> {

  const rawArticles =
    await loadArticles();


  const articles =
    rawArticles
      .filter(
        (
          article
        ) =>
          article?.status ===
            "published" &&
          article?.featured ===
            true
      )
      .map(
        (
          article
        ) =>
          formatArticle(
            article
          )
      );


  return sortArticles(
    articles
  ).slice(
    0,
    5
  );

}


// ============================================================
// CATEGORY ARTICLES
// ============================================================

export async function getPublishedArticlesByCategory(
  categoryId: string
): Promise<PublicArticle[]> {

  if (!categoryId) {
    return [];
  }


  const rawArticles =
    await loadArticles();


  const articles =
    rawArticles
      .filter(
        (
          article
        ) =>
          article?.status ===
            "published" &&
          article?.categoryId ===
            categoryId
      )
      .map(
        (
          article
        ) =>
          formatArticle(
            article
          )
      );


  return sortArticles(
    articles
  ).slice(
    0,
    18
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


  const rawArticles =
    await loadArticles();


  const article =
    rawArticles.find(
      (
        item
      ) =>
        item?.slug ===
        slug
    );


  if (!article) {
    return null;
  }


  return formatArticle(
    article
  );

}


// ============================================================
// RELATED ARTICLES
// ============================================================

export async function getRelatedArticles(
  categoryId: string,
  currentSlug: string
): Promise<PublicArticle[]> {

  if (!categoryId) {
    return [];
  }


  const rawArticles =
    await loadArticles();


  const articles =
    rawArticles
      .filter(
        (
          article
        ) =>
          article?.status ===
            "published" &&
          article?.categoryId ===
            categoryId &&
          article?.slug !==
            currentSlug
      )
      .map(
        (
          article
        ) =>
          formatArticle(
            article
          )
      );


  return sortArticles(
    articles
  ).slice(
    0,
    5
  );

}