import { NextResponse } from "next/server";

import {
  getArticleBySlug,
  getRelatedArticles,
  getAllPublishedArticles,
} from "@/services/public/article.public.service";

import { getArticleKeywords } from "@/lib/seo/article-keywords";

import { getCategories } from "@/services/public/category.public.service";

import { siteConfig } from "@/config/site";

import { renderAmpArticle } from "@/lib/amp/amp-template";


export const revalidate = 300; 
export const dynamicParams = true;


export async function generateStaticParams() {
  try {
    const articles = await getAllPublishedArticles();
    return articles.map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

// ------------------------------------------------------------
// GET /amp/[slug]
// ------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);

  if (!article) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const [related, categories] = await Promise.all([
    getRelatedArticles(article.categoryId, article.slug),
    getCategories(),
  ]);

  const category = categories.find(
  (item) => item.id === article.categoryId
);

const finalKeywords = getArticleKeywords({
  keywords: article.keywords,
  slug: article.slug,
  category: article.category,
  categoryHi: article.categoryHi,
  categorySlug: category?.slug,
});

const html = renderAmpArticle({
    article,
    related,
    category,
    siteConfig,
    keywords: finalKeywords,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
