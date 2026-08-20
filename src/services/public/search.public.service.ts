import fs from "fs/promises";
import path from "path";

import {
  PublicArticle,
} from "./article.public.service";

import {
  PublicVideo,
} from "./video.public.service";


// ============================================================
// LOAD ARTICLES
// ============================================================

async function loadArticles(): Promise<any[]> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "articles.json"
    );

    const file = await fs.readFile(
      filePath,
      "utf-8"
    );

    const data = JSON.parse(file);

    return Array.isArray(data)
      ? data
      : [];

  } catch (error) {
    console.error(
      "SEARCH LOAD ARTICLES ERROR:",
      error
    );

    return [];
  }
}


// ============================================================
// LOAD VIDEOS
// ============================================================

async function loadVideos(): Promise<any[]> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "videos.json"
    );

    const file = await fs.readFile(
      filePath,
      "utf-8"
    );

    const data = JSON.parse(file);

    return Array.isArray(data)
      ? data
      : [];

  } catch (error) {
    console.error(
      "SEARCH LOAD VIDEOS ERROR:",
      error
    );

    return [];
  }
}


// ============================================================
// FORMAT TIMESTAMP
// ============================================================

function formatTimestamp(
  value: any
): string | undefined {

  if (!value) {
    return undefined;
  }

  if (
    typeof value?.toDate === "function"
  ) {
    return value
      .toDate()
      .toISOString();
  }

  if (
    typeof value?.seconds === "number"
  ) {
    return new Date(
      value.seconds * 1000
    ).toISOString();
  }

  const date = new Date(value);

  if (
    isNaN(date.getTime())
  ) {
    return undefined;
  }

  return date.toISOString();
}


// ============================================================
// SEARCH ARTICLES
// ============================================================

export async function searchArticles(
  keyword: string
): Promise<PublicArticle[]> {

  const search =
    keyword
      ?.trim()
      .toLowerCase();

  if (!search) {
    return [];
  }

  const rawArticles =
    await loadArticles();


  return rawArticles

    // ONLY PUBLISHED
    .filter(
      (article) =>
        article?.status ===
        "published"
    )

    // SEARCH
    .filter(
      (article) => {

        const title =
          String(
            article?.title || ""
          ).toLowerCase();

        const shortDescription =
          String(
            article?.shortDescription || ""
          ).toLowerCase();

        const content =
          String(
            article?.content || ""
          ).toLowerCase();

        const seoTitle =
          String(
            article?.seoTitle || ""
          ).toLowerCase();

        const seoDescription =
          String(
            article?.seoDescription || ""
          ).toLowerCase();

        const category =
          String(
            article?.category || ""
          ).toLowerCase();

        const categoryHi =
          String(
            article?.categoryHi || ""
          ).toLowerCase();


        return (
          title.includes(search) ||
          shortDescription.includes(search) ||
          content.includes(search) ||
          seoTitle.includes(search) ||
          seoDescription.includes(search) ||
          category.includes(search) ||
          categoryHi.includes(search)
        );
      }
    )

    // FORMAT
    .map(
  (article): PublicArticle => ({
    id: String(article?.id || ""),

    title: article?.title || "",

    slug: article?.slug || "",

    thumbnail: article?.thumbnail || "",

    shortDescription:
      article?.shortDescription || "",

    content:
      article?.content || "",

    seoTitle:
      article?.seoTitle || "",

    seoDescription:
      article?.seoDescription || "",

    categoryId:
      article?.categoryId || "",

    category:
      article?.category || "",

    categoryHi:
      article?.categoryHi || "",

    featured:
      Boolean(article?.featured),

    breaking:
      Boolean(article?.breaking),

    priority:
      Number(article?.priority || 0),

    status:
      "published",

    author:
      article?.author,

    createdAt:
      formatTimestamp(article?.createdAt),

    updatedAt:
      formatTimestamp(article?.updatedAt),
  })
)
    // LIMIT SEARCH RESULTS
    .slice(0, 20);
}


// ============================================================
// SEARCH VIDEOS
// ============================================================

export async function searchVideos(
  keyword: string
): Promise<PublicVideo[]> {

  const search =
    keyword
      ?.trim()
      .toLowerCase();

  if (!search) {
    return [];
  }

  const rawVideos =
    await loadVideos();


  return rawVideos

    // ONLY PUBLISHED
    .filter(
      (video) =>
        video?.status ===
        "published"
    )

    // SEARCH
    .filter(
      (video) => {

        const title =
          String(
            video?.title || ""
          ).toLowerCase();

        const description =
          String(
            video?.description ||
            video?.shortDescription ||
            ""
          ).toLowerCase();

        const category =
          String(
            video?.category || ""
          ).toLowerCase();

        const categoryHi =
          String(
            video?.categoryHi || ""
          ).toLowerCase();


        return (
          title.includes(search) ||
          description.includes(search) ||
          category.includes(search) ||
          categoryHi.includes(search)
        );
      }
    )

    // FORMAT
    .map(
  (video): PublicVideo => {

    const youtubeUrl =
      video?.youtubeUrl ||
      video?.url ||
      "";

    return {
      id: String(video?.id || ""),

      title:
        video?.title || "",

      youtubeUrl,

      thumbnail:
        video?.thumbnail ||
        video?.image ||
        getYoutubeThumbnail(
          youtubeUrl
        ),

      description:
        video?.description ||
        video?.shortDescription ||
        "",

      categoryId:
        video?.categoryId || "",

      category:
        video?.category || "",

      categoryHi:
        video?.categoryHi || "",

      status:
        "published",

      createdAt:
        formatTimestamp(
          video?.createdAt
        ),

      updatedAt:
        formatTimestamp(
          video?.updatedAt
        ),

      views:
        Number(video?.views || 0),
    };
  }
)

    .slice(0, 20);
}


// ============================================================
// YOUTUBE THUMBNAIL
// ============================================================

function getYoutubeThumbnail(
  url: string
): string {

  if (!url) {
    return "";
  }

  try {

    const parsed =
      new URL(url);

    const videoId =
      parsed.searchParams.get("v");

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {

      const id =
        parsed.pathname
          .replace("/", "")
          .trim();

      if (id) {
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      }
    }

    const shortsMatch =
      parsed.pathname.match(
        /\/shorts\/([^/]+)/
      );

    if (shortsMatch?.[1]) {
      return `https://img.youtube.com/vi/${shortsMatch[1]}/maxresdefault.jpg`;
    }

    const embedMatch =
      parsed.pathname.match(
        /\/embed\/([^/]+)/
      );

    if (embedMatch?.[1]) {
      return `https://img.youtube.com/vi/${embedMatch[1]}/maxresdefault.jpg`;
    }

  } catch {
    return "";
  }

  return "";
}