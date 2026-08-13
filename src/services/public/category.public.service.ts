import fs from "fs/promises";
import path from "path";


// ============================================================
// PUBLIC CATEGORY SERVICE
// ============================================================
//
// Public website Firebase se categories/articles/videos
// READ nahi karti.
//
// Sources:
//
// public/data/categories.json
// public/data/articles.json
// public/data/videos.json
//
// Firebase:
// ONLY admin/master database
//
// ============================================================


// ============================================================
// TYPES
// ============================================================

export interface PublicCategory {

  id: string;

  name: string;

  nameHi: string;

  slug: string;

  status: "active" | "inactive";

  createdAt?: string;

  updatedAt?: string;

}


export interface CategoryArticle {

  id: string;

  title: string;

  slug: string;

  thumbnail: string;

  shortDescription: string;

  content: string;

  categoryId: string;

  status: "draft" | "published";

  breaking: boolean;

  featured: boolean;

  priority: number;

  seoTitle: string;

  seoDescription: string;

  createdAt?: string;

  updatedAt?: string;

}


export interface CategoryVideo {

  id: string;

  title: string;

  thumbnail: string;

  youtubeUrl: string;

  description: string;

  categoryId: string;

  status: "draft" | "published";

  createdAt?: string;

  updatedAt?: string;

}


// ============================================================
// PATHS
// ============================================================

const CATEGORIES_PATH =
  path.join(
    process.cwd(),
    "public",
    "data",
    "categories.json"
  );


const ARTICLES_PATH =
  path.join(
    process.cwd(),
    "public",
    "data",
    "articles.json"
  );


const VIDEOS_PATH =
  path.join(
    process.cwd(),
    "public",
    "data",
    "videos.json"
  );


// ============================================================
// LOAD JSON
// ============================================================

async function loadJson(
  filePath: string,
  fileName: string
): Promise<any[]> {

  try {

    const file =
      await fs.readFile(
        filePath,
        "utf-8"
      );


    const data =
      JSON.parse(file);


    if (!Array.isArray(data)) {

      console.error(
        `${fileName} is not an array`
      );

      return [];

    }


    return data;

  } catch (error) {

    console.error(
      `LOAD ${fileName} ERROR:`,
      error
    );

    return [];

  }

}


// ============================================================
// LOAD CATEGORIES
// ============================================================

async function loadCategories(): Promise<any[]> {

  return loadJson(
    CATEGORIES_PATH,
    "categories.json"
  );

}


// ============================================================
// LOAD ARTICLES
// ============================================================

async function loadArticles(): Promise<any[]> {

  return loadJson(
    ARTICLES_PATH,
    "articles.json"
  );

}


// ============================================================
// LOAD VIDEOS
// ============================================================

async function loadVideos(): Promise<any[]> {

  return loadJson(
    VIDEOS_PATH,
    "videos.json"
  );

}


// ============================================================
// FORMAT CATEGORY
// ============================================================

function formatCategory(
  data: any
): PublicCategory {

  return {

    id:
      String(
        data?.id || ""
      ),

    name:
      data?.name || "",

    nameHi:
      data?.nameHi || "",

    slug:
      data?.slug || "",

    status:
      data?.status ===
      "inactive"
        ? "inactive"
        : "active",

    createdAt:
      data?.createdAt ||
      undefined,

    updatedAt:
      data?.updatedAt ||
      undefined,

  };

}


// ============================================================
// FORMAT ARTICLE
// ============================================================

function formatArticle(
  data: any
): CategoryArticle {

  return {

    id:
      String(
        data?.id || ""
      ),

    title:
      data?.title || "",

    slug:
      data?.slug || "",

    thumbnail:
      data?.thumbnail || "",

    shortDescription:
      data?.shortDescription || "",

    content:
      data?.content || "",

    categoryId:
      String(
        data?.categoryId || ""
      ),

    status:
      data?.status ===
      "published"
        ? "published"
        : "draft",

    breaking:
      Boolean(
        data?.breaking
      ),

    featured:
      Boolean(
        data?.featured
      ),

    priority:
      Number(
        data?.priority || 0
      ),

    seoTitle:
      data?.seoTitle || "",

    seoDescription:
      data?.seoDescription || "",

    createdAt:
      data?.createdAt ||
      undefined,

    updatedAt:
      data?.updatedAt ||
      undefined,

  };

}


// ============================================================
// FORMAT VIDEO
// ============================================================

function formatVideo(
  data: any
): CategoryVideo {

  return {

    id:
      String(
        data?.id || ""
      ),

    title:
      data?.title || "",

    thumbnail:
      data?.thumbnail ||
      data?.image ||
      "",

    youtubeUrl:
      data?.youtubeUrl ||
      data?.url ||
      "",

    description:
      data?.description ||
      data?.shortDescription ||
      "",

    categoryId:
      String(
        data?.categoryId || ""
      ),

    status:
      data?.status ===
      "published"
        ? "published"
        : "draft",

    createdAt:
      data?.createdAt ||
      undefined,

    updatedAt:
      data?.updatedAt ||
      undefined,

  };

}


// ============================================================
// GET ALL ACTIVE CATEGORIES
// ============================================================

export async function getCategories()
: Promise<PublicCategory[]> {

  const rawCategories =
    await loadCategories();


  return rawCategories

    .filter(
      (category) =>
        category?.status ===
        "active"
    )

    .map(
      (category) =>
        formatCategory(
          category
        )
    );

}


// ============================================================
// GET CATEGORY BY SLUG
// ============================================================

export async function getCategoryBySlug(
  slug: string
): Promise<PublicCategory | null> {

  if (!slug) {
    return null;
  }


  const rawCategories =
    await loadCategories();


  const category =
    rawCategories.find(
      (item) =>

        item?.status ===
          "active" &&

        String(
          item?.slug || ""
        ).toLowerCase() ===
          String(
            slug
          ).toLowerCase()
    );


  if (!category) {
    return null;
  }


  return formatCategory(
    category
  );

}


// ============================================================
// GET CATEGORY BY ID
// ============================================================

export async function getCategoryById(
  categoryId: string
): Promise<PublicCategory | null> {

  if (!categoryId) {
    return null;
  }


  const rawCategories =
    await loadCategories();


  const category =
    rawCategories.find(
      (item) =>

        item?.status ===
          "active" &&

        String(
          item?.id || ""
        ) ===
          String(
            categoryId
          )
    );


  if (!category) {
    return null;
  }


  return formatCategory(
    category
  );

}


// ============================================================
// GET CATEGORY ARTICLES
// ============================================================

export async function getCategoryArticles(
  categoryId: string
): Promise<CategoryArticle[]> {

  if (!categoryId) {
    return [];
  }

  // Check category is active
  const category =
    await getCategoryById(categoryId);

  if (!category) {
    return [];
  }

  const rawArticles =
    await loadArticles();

  const articles =
    rawArticles
      .filter(
        (article) =>
          article?.status === "published" &&
          String(article?.categoryId || "") ===
            String(categoryId)
      )
      .map((article) =>
        formatArticle(article)
      );

  return articles
    .sort((a, b) => {
      const priorityA =
        Number(a.priority || 0);

      const priorityB =
        Number(b.priority || 0);

      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }

      const dateA =
        new Date(a.createdAt || 0).getTime();

      const dateB =
        new Date(b.createdAt || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 18);
}


// ============================================================
// GET CATEGORY VIDEOS
// ============================================================

export async function getCategoryVideos(
  categoryId: string
): Promise<CategoryVideo[]> {

  if (!categoryId) {
    return [];
  }

  // Check category is active
  const category =
    await getCategoryById(categoryId);

  if (!category) {
    return [];
  }

  const rawVideos =
    await loadVideos();

  const videos =
    rawVideos
      .filter(
        (video) =>
          video?.status === "published" &&
          String(video?.categoryId || "") ===
            String(categoryId)
      )
      .map((video) =>
        formatVideo(video)
      );

  return videos
    .sort((a, b) => {
      const dateA =
        new Date(a.createdAt || 0).getTime();

      const dateB =
        new Date(b.createdAt || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 18);
}