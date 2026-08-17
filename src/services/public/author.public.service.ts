import fs from "fs/promises";
import path from "path";

import type { PublicArticle } from "./article.public.service";

// ======================================================
// PUBLIC AUTHOR
// ======================================================

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

// ======================================================
// PATHS
// ======================================================

const DATA_PATH = path.join(process.cwd(), "public", "data");

const AUTHORS_PATH = path.join(
  DATA_PATH,
  "authors.json"
);

const ARTICLES_PATH = path.join(
  DATA_PATH,
  "articles.json"
);

// ======================================================
// TIMESTAMP
// ======================================================

function formatTimestamp(
  value: any
): string | undefined {
  if (!value) return undefined;

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (
    typeof value === "object" &&
    typeof value?.seconds === "number"
  ) {
    return new Date(
      value.seconds * 1000
    ).toISOString();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

// ======================================================
// SLUG
// ======================================================

function createAuthorSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ======================================================
// LOAD AUTHORS
// ======================================================

async function loadAuthors(): Promise<any[]> {
  try {
    const file = await fs.readFile(
      AUTHORS_PATH,
      "utf-8"
    );

    const data = JSON.parse(file);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(
      "LOAD AUTHORS JSON ERROR:",
      error
    );

    return [];
  }
}

// ======================================================
// LOAD ARTICLES
// ======================================================

async function loadArticles(): Promise<any[]> {
  try {
    const file = await fs.readFile(
      ARTICLES_PATH,
      "utf-8"
    );

    const data = JSON.parse(file);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(
      "LOAD ARTICLES JSON ERROR:",
      error
    );

    return [];
  }
}

// ======================================================
// FORMAT AUTHOR
// ======================================================

function formatAuthor(
  data: any
): PublicAuthor {
  const name = data?.name || "";

  return {
    uid: String(
      data?.uid ||
      data?.id ||
      ""
    ),

    name,

    email: data?.email || "",

    role: data?.role || "editor",

    photo: data?.photo || "",

    slug:
      data?.slug ||
      createAuthorSlug(name),

    status: data?.status || "active",

    bio: data?.bio || "",
  };
}

// ======================================================
// GET AUTHOR BY SLUG
// ======================================================

export async function getAuthorBySlug(
  slug: string
): Promise<PublicAuthor | null> {
  if (!slug) return null;

  const cleanSlug = slug
    .trim()
    .toLowerCase();

  const rawAuthors = await loadAuthors();

  const author = rawAuthors.find(
    (item) =>
      String(item?.slug || "")
        .trim()
        .toLowerCase() === cleanSlug
  );

  if (!author) return null;

  const formatted = formatAuthor(author);

  if (formatted.status !== "active") {
    return null;
  }

  return formatted;
}

// ======================================================
// ALL PUBLIC AUTHORS
// ======================================================

export async function getPublicAuthors(): Promise<
  PublicAuthor[]
> {
  const rawAuthors = await loadAuthors();

  return rawAuthors
    .map(formatAuthor)
    .filter(
      (author) =>
        author.status === "active"
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );
}

// ======================================================
// FORMAT PUBLIC ARTICLE
// ======================================================

function formatPublicArticle(
  article: any
): PublicArticle {
  return {
    id: String(article?.id || ""),

    title: article?.title || "",

    slug: article?.slug || "",

    thumbnail: article?.thumbnail || "",

    shortDescription:
      article?.shortDescription || "",

    content: article?.content || "",

    seoTitle: article?.seoTitle || "",

    seoDescription:
      article?.seoDescription || "",

    categoryId:
      article?.categoryId || "",

    category:
      article?.category || "",

    categoryHi:
      article?.categoryHi || "",

    featured:
      article?.featured || false,

    breaking:
      article?.breaking || false,

    priority:
      article?.priority || 0,

    status:
      article?.status || "published",

    author:
      article?.author || {
        name: "INFINIA BHARAT NEWS",
        role: "admin",
      },

    createdAt: formatTimestamp(
      article?.createdAt
    ),

    updatedAt: formatTimestamp(
      article?.updatedAt
    ),
  } satisfies PublicArticle;
}

// ======================================================
// GET AUTHOR ARTICLES
// ======================================================

export async function getAuthorArticles(
  authorUid: string
): Promise<PublicArticle[]> {
  if (!authorUid) return [];

  try {
    const rawArticles = await loadArticles();

    const articles = rawArticles
      .filter((article: any) => {
        if (
          article?.status !==
          "published"
        ) {
          return false;
        }

        return (
          String(
            article?.author?.uid || ""
          ) === String(authorUid)
        );
      })
      .map(formatPublicArticle);

    articles.sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(
            a.createdAt
          ).getTime()
        : 0;

      const dateB = b.createdAt
        ? new Date(
            b.createdAt
          ).getTime()
        : 0;

      return dateB - dateA;
    });

    return articles;
  } catch (error) {
    console.error(
      "GET AUTHOR ARTICLES ERROR:",
      error
    );

    return [];
  }
}

// ======================================================
// GET ALL AUTHORS + ARTICLES
// ======================================================

export async function getAuthorsDirectory() {
  const [
    rawAuthors,
    rawArticles,
  ] = await Promise.all([
    loadAuthors(),
    loadArticles(),
  ]);

  const authors = rawAuthors
    .map(formatAuthor)
    .filter(
      (author) =>
        author.status === "active"
    );

  const articles =
    rawArticles
      .filter(
        (article: any) =>
          article?.status ===
          "published"
      )
      .map(formatPublicArticle);

  const grouped =
    new Map<
      string,
      PublicArticle[]
    >();

  for (const article of articles) {
    const uid = String(
      article?.author?.uid || ""
    );

    if (!uid) continue;

    const existing =
      grouped.get(uid) || [];

    existing.push(article);

    grouped.set(
      uid,
      existing
    );
  }

  return authors
    .map((author) => {
      const authorArticles =
        grouped.get(
          String(author.uid)
        ) || [];

      authorArticles.sort(
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

          return dateB - dateA;
        }
      );

      return {
        author,
        articles:
          authorArticles,
        latestArticle:
          authorArticles[0] ||
          null,
      };
    })
    .sort((a, b) => {
      const count =
        b.articles.length -
        a.articles.length;

      if (count !== 0) {
        return count;
      }

      return a.author.name.localeCompare(
        b.author.name
      );
    });
}